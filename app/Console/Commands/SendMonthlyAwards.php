<?php

namespace App\Console\Commands;

use App\Models\Award;
use App\Models\User;
use App\Support\AwardCategory;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SendMonthlyAwards extends Command
{
    protected $signature = 'awards:send
        {--month= : Month to award in YYYY-MM format (defaults to current month)}
        {--connection= : Database connection to use (e.g. pgsql_prod)}
        {--test= : Send only to this email address (for testing the email before sending all)}';

    protected $description = 'Generate and send monthly recognition awards to eligible users';

    public function handle(): int
    {
        $month = $this->resolveMonth();

        if (! $month) {
            return self::FAILURE;
        }

        // Switch DB connection if specified
        if ($connection = $this->option('connection')) {
            if (! config("database.connections.{$connection}")) {
                $this->error("Database connection [{$connection}] not configured.");

                return self::FAILURE;
            }
            DB::setDefaultConnection($connection);
            $this->info("🔌 Usando conexión: <comment>{$connection}</comment>");
        }

        $this->info("📅 Reconocimientos para: <comment>{$month->locale('es')->isoFormat('MMMM YYYY')}</comment>");
        $this->newLine();

        // Test mode: send only to a specific user
        if ($testEmail = $this->option('test')) {
            return $this->handleTestMode($testEmail, $month);
        }

        $users = $this->getPendingUsers($month);

        if ($users->isEmpty()) {
            $this->warn('No hay usuarios pendientes de reconocimiento para este mes.');

            return self::SUCCESS;
        }

        // Build the confirmation table
        $tableRows = $users->map(function (User $user) use ($month) {
            $category = AwardCategory::for($user->days_count, $month);

            return [
                $user->email,
                $user->name,
                $user->days_count,
                $this->formatCategory($category),
            ];
        })->toArray();

        $this->table(
            ['Email', 'Nombre', 'Días respondidos', 'Categoría'],
            $tableRows
        );

        $this->newLine();
        $this->info("Total: <comment>{$users->count()}</comment> usuario(s) recibirán reconocimiento.");
        $this->newLine();

        if (! $this->confirm('¿Deseas enviar los reconocimientos a todos estos usuarios?', false)) {
            $this->warn('Operación cancelada.');

            return self::SUCCESS;
        }

        $this->newLine();
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $success = 0;
        $failed = 0;

        foreach ($users as $user) {
            try {
                Award::create([
                    'user_id' => $user->id,
                    'category' => AwardCategory::for($user->days_count, $month),
                    'days_count' => $user->days_count,
                    'month_date' => $month->toDateString(),
                ]);
                $success++;
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("  ✗ Error con {$user->name} ({$user->email}): {$e->getMessage()}");
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        if ($failed > 0) {
            $this->warn("Resultado: {$success} enviados correctamente, {$failed} fallaron.");

            return self::FAILURE;
        }

        $this->info("✅ {$success} reconocimiento(s) generados y enviados correctamente.");
        $this->info('Los PDFs se generarán y enviarán por email a través de la cola de trabajos.');

        return self::SUCCESS;
    }

    /**
     * Test mode: generate and send an award only to a specific user by email.
     */
    private function handleTestMode(string $email, Carbon $month): int
    {
        $user = User::query()
            ->withCount(['responses as days_count' => function ($query) use ($month) {
                $query->select(DB::raw('COUNT(DISTINCT day_id)'))
                    ->whereHas('day', function ($dayQuery) use ($month) {
                        $dayQuery->whereMonth('date_assigned', $month->month)
                            ->whereYear('date_assigned', $month->year);
                    });
            }])
            ->where('email', $email)
            ->first();

        if (! $user) {
            $this->error("No se encontró usuario con email: {$email}");

            return self::FAILURE;
        }

        $category = AwardCategory::for($user->days_count, $month);

        $this->table(
            ['Email', 'Nombre', 'Días respondidos', 'Categoría'],
            [[$user->email, $user->name, $user->days_count, $this->formatCategory($category)]]
        );

        $this->newLine();
        $this->info('🧪 <comment>MODO TEST</comment> — Solo se enviará a este usuario.');

        if (! $this->confirm('¿Enviar reconocimiento de prueba?', false)) {
            $this->warn('Operación cancelada.');

            return self::SUCCESS;
        }

        try {
            Award::create([
                'user_id' => $user->id,
                'category' => $category,
                'days_count' => $user->days_count,
                'month_date' => $month->toDateString(),
            ]);

            $this->newLine();
            $this->info("✅ Reconocimiento generado para {$user->name}.");
            $this->info("   El PDF se generará y enviará a <comment>{$user->email}</comment> via la cola.");
            $this->info('   Ejecuta <comment>php artisan queue:work --once</comment> para procesarlo ahora.');

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");

            return self::FAILURE;
        }
    }

    private function resolveMonth(): ?Carbon
    {
        $input = $this->option('month');

        if (! $input) {
            return now();
        }

        try {
            return Carbon::createFromFormat('Y-m', $input)->endOfMonth();
        } catch (\Exception) {
            $this->error("Formato de mes inválido: '{$input}'. Usa YYYY-MM (ej: 2026-07).");

            return null;
        }
    }

    /**
     * Get users who have responses in the given month but haven't received an award yet.
     */
    private function getPendingUsers(Carbon $month): Collection
    {
        $dateFormatSql = DB::connection()->getDriverName() === 'pgsql'
            ? "TO_CHAR(awards.month_date, 'YYYY-MM')"
            : "DATE_FORMAT(awards.month_date, '%Y-%m')";

        return User::query()
            ->withCount(['responses as days_count' => function ($query) use ($month) {
                $query->select(DB::raw('COUNT(DISTINCT day_id)'))
                    ->whereHas('day', function ($dayQuery) use ($month) {
                        $dayQuery->whereMonth('date_assigned', $month->month)
                            ->whereYear('date_assigned', $month->year);
                    });
            }])
            ->whereExists(function ($query) use ($month) {
                $query->select(DB::raw(1))
                    ->from('responses')
                    ->whereColumn('responses.user_id', 'users.id')
                    ->whereExists(function ($q) use ($month) {
                        $q->select(DB::raw(1))
                            ->from('days')
                            ->whereColumn('days.id', 'responses.day_id')
                            ->whereMonth('date_assigned', $month->month)
                            ->whereYear('date_assigned', $month->year);
                    });
            })
            ->whereNotExists(function ($query) use ($dateFormatSql, $month) {
                $query->select(DB::raw(1))
                    ->from('awards')
                    ->whereColumn('awards.user_id', 'users.id')
                    ->whereRaw("{$dateFormatSql} = ?", [$month->format('Y-m')]);
            })
            ->orderByDesc('days_count')
            ->get();
    }

    private function formatCategory(string $category): string
    {
        return match ($category) {
            'gold' => '🥇 Oro',
            'silver' => '🥈 Plata',
            'bronze' => '🥉 Bronce',
            default => $category,
        };
    }
}
