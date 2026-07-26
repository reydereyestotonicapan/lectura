<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;

class SyncProdToStage extends Command
{
    protected $signature = 'db:sync-from-prod {--fresh : Wipe the stage tables first so it becomes an exact copy of prod}';

    protected $description = 'Copy records from lectura-prod-db to lectura-stage-db (insert only by default; use --fresh for an exact clean copy)';

    /**
     * Tables to sync in dependency order (parents before children).
     * Laravel/Spatie system tables are excluded (migrations, cache, jobs, sessions, etc.)
     */
    private array $tables = [
        'users',
        'days',
        'questions',
        'answers',
        'responses',
        'awards',
        'categories',
        'ministries',
        'assets',
        'movement_types',
        'movements',
        'roles',
        'permissions',
        'model_has_roles',
        'model_has_permissions',
        'role_has_permissions',
    ];

    public function handle(): int
    {
        if (! config('database.connections.pgsql_prod.url')) {
            $this->error('PROD_DB_URL is not set in your .env file.');

            return self::FAILURE;
        }

        if (! config('database.connections.pgsql_stage.url')) {
            $this->error('STAGE_DB_URL is not set in your .env file.');

            return self::FAILURE;
        }

        $prod = DB::connection('pgsql_prod');
        $stage = DB::connection('pgsql_stage');

        if ($this->option('fresh')) {
            if (! $this->confirm('This will WIPE all synced tables in STAGE and replace them with an exact copy of PROD. Continue?', false)) {
                $this->warn('Aborted.');

                return self::FAILURE;
            }

            $this->truncateStage($stage);
        }

        $totalInserted = 0;

        foreach ($this->tables as $table) {
            $this->info("Syncing <comment>{$table}</comment>...");

            $rows = $prod->table($table)->get()->toArray();

            if (empty($rows)) {
                $this->line('  → 0 rows in prod, skipped.');

                continue;
            }

            $rows = array_map(fn ($row) => (array) $row, $rows);

            // Insert rows that don't exist yet, identified by primary key (id).
            // Tables without a numeric id (pivot tables) use all columns as the
            // conflict target via a raw upsert that skips on any conflict.
            $hasPrimaryKey = array_key_exists('id', $rows[0]);

            $inserted = 0;
            $chunks = array_chunk($rows, 200);

            foreach ($chunks as $chunk) {
                if ($hasPrimaryKey) {
                    $ids = array_column($chunk, 'id');
                    $existingIds = $stage->table($table)
                        ->whereIn('id', $ids)
                        ->pluck('id')
                        ->flip()
                        ->all();
                    $newRows = array_filter($chunk, fn ($r) => ! isset($existingIds[$r['id']]));
                } else {
                    // Pivot tables: insert all, ignore duplicates via upsert with no updates
                    $newRows = $chunk;
                }

                if (empty($newRows)) {
                    continue;
                }

                try {
                    $stage->table($table)->insertOrIgnore(array_values($newRows));
                    $inserted += count($newRows);
                } catch (\Throwable $e) {
                    $this->warn("  ⚠ Error on {$table}: ".$e->getMessage());
                }
            }

            $totalInserted += $inserted;
            $skipped = count($rows) - $inserted;
            $this->line("  → {$inserted} inserted, {$skipped} already existed.");
        }

        $this->newLine();
        $this->info("Done. Total new records inserted: {$totalInserted}");

        $this->resetSequences($stage);

        return self::SUCCESS;
    }

    private function truncateStage(Connection $stage): void
    {
        $this->info('Wiping stage tables for a clean copy...');

        // Quote each table and truncate them all together. RESTART IDENTITY
        // resets sequences; CASCADE also clears any table with an FK into these.
        $quoted = implode(', ', array_map(fn ($t) => "\"{$t}\"", $this->tables));

        try {
            $stage->statement("TRUNCATE TABLE {$quoted} RESTART IDENTITY CASCADE");
            $this->line('  → stage tables truncated.');
        } catch (\Throwable $e) {
            $this->warn('  ⚠ Truncate failed: '.$e->getMessage());
        }

        $this->newLine();
    }

    private function resetSequences(Connection $stage): void
    {
        $this->info('Resetting sequences...');

        foreach ($this->tables as $table) {
            try {
                $sequence = $stage->selectOne(
                    "SELECT pg_get_serial_sequence(?, 'id') AS seq",
                    [$table]
                );

                if (! $sequence?->seq) {
                    continue;
                }

                $stage->statement(
                    "SELECT setval(?, COALESCE((SELECT MAX(id) FROM \"{$table}\"), 1))",
                    [$sequence->seq]
                );

                $this->line("  → {$table} sequence reset.");
            } catch (\Throwable) {
                // Table has no id sequence (pivot tables), skip silently
            }
        }
    }
}
