<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncStageToLocal extends Command
{
    protected $signature = 'db:sync-from-stage';

    protected $description = 'Copy new records from lectura-stage-db (Postgres) to local MySQL backup (insert only, never overwrites)';

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

        $stage = DB::connection('pgsql_stage');
        $local = DB::connection('mysql');

        $totalInserted = 0;

        foreach ($this->tables as $table) {
            $this->info("Syncing <comment>{$table}</comment>...");

            $rows = $stage->table($table)->get()->toArray();

            if (empty($rows)) {
                $this->line("  → 0 rows in stage, skipped.");
                continue;
            }

            $rows = array_map(fn ($row) => (array) $row, $rows);

            $hasPrimaryKey = array_key_exists('id', $rows[0]);

            $inserted = 0;
            $chunks   = array_chunk($rows, 200);

            foreach ($chunks as $chunk) {
                if ($hasPrimaryKey) {
                    $ids         = array_column($chunk, 'id');
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
