<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;

class SyncStageToLocal extends Command
{
    protected $signature = 'db:sync-from-stage {--fresh : Wipe the local tables first so it becomes an exact copy of stage}';

    protected $description = 'Copy records from lectura-stage-db (Postgres) to the local Docker Postgres backup (insert only by default; use --fresh for an exact clean copy)';

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
        if (! config('database.connections.pgsql_stage.url')) {
            $this->error('STAGE_DB_URL is not set in your .env file.');

            return self::FAILURE;
        }

        if (! config('database.connections.pgsql_local.url')) {
            $this->error('LOCAL_DB_URL is not set in your .env file.');

            return self::FAILURE;
        }

        $stage = DB::connection('pgsql_stage');
        $local = DB::connection('pgsql_local');

        if ($this->option('fresh')) {
            if (! $this->confirm('This will WIPE all synced tables in LOCAL and replace them with an exact copy of STAGE. Continue?', false)) {
                $this->warn('Aborted.');

                return self::FAILURE;
            }

            $this->truncateLocal($local);
        }

        $totalInserted = 0;

        foreach ($this->tables as $table) {
            $this->info("Syncing <comment>{$table}</comment>...");

            $rows = $stage->table($table)->get()->toArray();

            if (empty($rows)) {
                $this->line('  → 0 rows in stage, skipped.');

                continue;
            }

            $rows = array_map(fn ($row) => (array) $row, $rows);

            $hasPrimaryKey = array_key_exists('id', $rows[0]);

            $inserted = 0;
            $chunks = array_chunk($rows, 200);

            foreach ($chunks as $chunk) {
                if ($hasPrimaryKey) {
                    $ids = array_column($chunk, 'id');
                    $existingIds = $local->table($table)
                        ->whereIn('id', $ids)
                        ->pluck('id')
                        ->flip()
                        ->all();
                    $newRows = array_filter($chunk, fn ($r) => ! isset($existingIds[$r['id']]));
                } else {
                    $newRows = $chunk;
                }

                if (empty($newRows)) {
                    continue;
                }

                try {
                    $local->table($table)->insertOrIgnore(array_values($newRows));
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

        $this->resetSequences($local);

        return self::SUCCESS;
    }

    private function truncateLocal(Connection $local): void
    {
        $this->info('Wiping local tables for a clean copy...');

        // Quote each table and truncate them all together. RESTART IDENTITY
        // resets sequences; CASCADE also clears any table with an FK into these.
        $quoted = implode(', ', array_map(fn ($t) => "\"{$t}\"", $this->tables));

        try {
            $local->statement("TRUNCATE TABLE {$quoted} RESTART IDENTITY CASCADE");
            $this->line('  → local tables truncated.');
        } catch (\Throwable $e) {
            $this->warn('  ⚠ Truncate failed: '.$e->getMessage());
        }

        $this->newLine();
    }

    private function resetSequences(Connection $local): void
    {
        $this->info('Resetting sequences...');

        foreach ($this->tables as $table) {
            try {
                $sequence = $local->selectOne(
                    "SELECT pg_get_serial_sequence(?, 'id') AS seq",
                    [$table]
                );

                if (! $sequence?->seq) {
                    continue;
                }

                $local->statement(
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
