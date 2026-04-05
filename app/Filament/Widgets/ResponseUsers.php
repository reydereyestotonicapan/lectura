<?php

namespace App\Filament\Widgets;

use App\Models\Award;
use App\Models\User;
use Filament\Notifications\Notification;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Support\Facades\DB;

class ResponseUsers extends BaseWidget
{
    protected static ?string $heading = 'Dias contestados por usuario en el presente mes';
    private const int MIN_SILVER_CATEGORY = 10;
    private const int MIN_GOLD_CATEGORY = 20;

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        $dateFormatSql = DB::connection()->getDriverName() === 'pgsql'
            ? "TO_CHAR(awards.month_date, 'YYYY-MM')"
            : "DATE_FORMAT(awards.month_date, '%Y-%m')";
        return $table
            ->query(
                User::query()
                    ->withCount(['responses as days_count' => function ($query) {
                        $query->select(DB::raw('COUNT(DISTINCT day_id)'))
                            ->whereHas('day', function ($dayQuery) {
                                $dayQuery->whereMonth('date_assigned', now()->month)
                                    ->whereYear('date_assigned', now()->year);
                            });
                    }])
                    ->whereExists(function ($query) {
                        $query->select(DB::raw(1))
                            ->from('responses')
                            ->whereColumn('responses.user_id', 'users.id')
                            ->whereExists(function ($q) {
                                $q->select(DB::raw(1))
                                    ->from('days')
                                    ->whereColumn('days.id', 'responses.day_id')
                                    ->whereMonth('date_assigned', now()->month)
                                    ->whereYear('date_assigned', now()->year);
                            });
                    })
                    ->whereNotExists(function ($query) use ($dateFormatSql) {
                        $query->select(DB::raw(1))
                            ->from('awards')
                            ->whereColumn('awards.user_id', 'users.id')
                            ->whereRaw("{$dateFormatSql} = ?", [now()->format('Y-m')]);
                    })
                    ->orderByDesc('days_count')
            )
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('days_count')
                    ->label('Días respondidos')
            ])
            ->headerActions([
                Tables\Actions\Action::make('sendAllAwards')
                    ->visible(fn () => self::isAwardingOpen())
                    ->label(fn () => self::hasPendingUsers()
                        ? 'Enviar todos los reconocimientos'
                        : 'Reconocimientos ya enviados')
                    ->icon(fn () => self::hasPendingUsers()
                        ? 'heroicon-o-paper-airplane'
                        : 'heroicon-o-check-circle')
                    ->color(fn () => self::hasPendingUsers() ? 'warning' : 'gray')
                    ->tooltip(fn () => self::hasPendingUsers()
                        ? null
                        : 'Todos los reconocimientos del mes ya fueron enviados')
                    ->requiresConfirmation(fn () => self::hasPendingUsers())
                    ->modalHeading('Enviar reconocimientos a todos')
                    ->modalDescription('Se generará y enviará un reconocimiento a cada usuario que aparece en esta tabla. ¿Deseas continuar?')
                    ->modalSubmitActionLabel('Sí, enviar todos')
                    ->action(function () {
                        if (!self::hasPendingUsers()) {
                            return;
                        }
                        $dateFormatSql = DB::connection()->getDriverName() === 'pgsql'
                            ? "TO_CHAR(awards.month_date, 'YYYY-MM')"
                            : "DATE_FORMAT(awards.month_date, '%Y-%m')";

                        $users = User::query()
                            ->withCount(['responses as days_count' => function ($query) {
                                $query->select(DB::raw('COUNT(DISTINCT day_id)'))
                                    ->whereHas('day', function ($dayQuery) {
                                        $dayQuery->whereMonth('date_assigned', now()->month)
                                            ->whereYear('date_assigned', now()->year);
                                    });
                            }])
                            ->whereExists(function ($query) {
                                $query->select(DB::raw(1))
                                    ->from('responses')
                                    ->whereColumn('responses.user_id', 'users.id')
                                    ->whereExists(function ($q) {
                                        $q->select(DB::raw(1))
                                            ->from('days')
                                            ->whereColumn('days.id', 'responses.day_id')
                                            ->whereMonth('date_assigned', now()->month)
                                            ->whereYear('date_assigned', now()->year);
                                    });
                            })
                            ->whereNotExists(function ($query) use ($dateFormatSql) {
                                $query->select(DB::raw(1))
                                    ->from('awards')
                                    ->whereColumn('awards.user_id', 'users.id')
                                    ->whereRaw("{$dateFormatSql} = ?", [now()->format('Y-m')]);
                            })
                            ->get();

                        $success = 0;
                        $failed = 0;
                        foreach ($users as $user) {
                            self::generateAwardForUser($user) ? $success++ : $failed++;
                        }

                        $failed > 0
                            ? self::errorNotification('Reconocimientos enviados con errores', "{$success} enviados correctamente, {$failed} fallaron.")
                            : self::successNotification('Reconocimientos enviados', "Se generaron y enviaron {$success} reconocimiento(s) correctamente.");
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('notification')
                    ->visible(fn () => self::isAwardingOpen())
                    ->label('Generar reconocimiento')
                    ->action(function (User $user) {
                        $award = self::generateAwardForUser($user);
                        $award ? self::successNotification('Reconocmiento generado', 'El reconocimiento ha sido generado y enviado correctamente.') : self::errorNotification('Problemas al generar reconocimiento','Ocurrio un problema al generar el reconocimiento');
                    }),
            ])
            //TODO check how I can show pagination links
            ;
    }

    private static function successNotification(string $title, string $body): void
    {
        Notification::make()
        ->title($title)
        ->success()
        ->body($body)
        ->color('success')
        ->duration(8000)
        ->send();

    }
    private static function errorNotification(string $title, string $body): void
    {
        Notification::make()
            ->title($title)
            ->danger()
            ->body($body)
            ->color('danger')
            ->duration(8000)
            ->send();

    }
    private static function hasPendingUsers(): bool
    {
        $dateFormatSql = DB::connection()->getDriverName() === 'pgsql'
            ? "TO_CHAR(awards.month_date, 'YYYY-MM')"
            : "DATE_FORMAT(awards.month_date, '%Y-%m')";

        return User::query()
            ->whereHas('responses', function ($query) {
                $query->whereHas('day', function ($dayQuery) {
                    $dayQuery->whereMonth('date_assigned', now()->month)
                        ->whereYear('date_assigned', now()->year);
                });
            })
            ->whereNotExists(function ($query) use ($dateFormatSql) {
                $query->select(DB::raw(1))
                    ->from('awards')
                    ->whereColumn('awards.user_id', 'users.id')
                    ->whereRaw("{$dateFormatSql} = ?", [now()->format('Y-m')]);
            })
            ->exists();
    }

    public static function generateAwardForUser(User $user): bool
    {
        try {
            Award::create([
                'user_id' => $user->id,
                'category' => $user->days_count >= self::MIN_GOLD_CATEGORY ? 'gold' : ($user->days_count >= self::MIN_SILVER_CATEGORY ? 'silver' : 'bronze'),
                'days_count' => $user->days_count
            ]);
            return true;
        }catch (\Exception $e){
            return false;
        }
    }
    private static function isAwardingOpen(): bool
    {
        return app()->isLocal() || now()->isLastOfMonth();
    }

    public static function canView(): bool
    {
        return auth()->user()->can('widget_ResponseUsers');
    }
}
