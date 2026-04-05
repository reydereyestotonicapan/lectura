<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncProdToStage extends Command
{
    protected $signature = 'db:sync-from-prod';

    protected $description = 'Copy new records from lectura-prod-db to lectura-stage-db (insert only, never overwrites)';

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

        $prod  = DB::connection('pgsql_prod');
        $stage = DB::connection('pgsql_stage');

        $totalInserted = 0;

        foreach ($this->tables as $table) {
            $this->info("Syncing <comment>{$table}</comment>...");

            $rows = $prod->table($table)->get()->toArray();

            if (empty($rows)) {
                $this->line("  → 0 rows in prod, skipped.");
                continue;
            }

            $rows = array_map(fn ($row) => (array) $row, $rows);

            // Insert rows that don't exist yet, identified by primary key (id).
            // Tables without a numeric id (pivot tables) use all columns as the
            // conflict target via a raw upsert that skips on any conflict.
            $hasPrimaryKey = array_key_exists('id', $rows[0]);

            $inserted = 0;
            $chunks   = array_chunk($rows, 200);

            foreach ($chunks as $chunk) {
                if ($hasPrimaryKey) {
                    $ids            = array_column($chunk, 'id');
                    $existingIds    = $stage->table($table)
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
                    $this->warn("  ⚠ Error on {$table}: " . $e->getMessage());
                }
            }

            $totalInserted += $inserted;
            $skipped = count($rows) - $inserted;
            $this->line("  → {$inserted} inserted, {$skipped} already existed.");
        }

        $this->newLine();
        $this->info("Done. Total new records inserted: {$totalInserted}");

        return self::SUCCESS;
    }
}
