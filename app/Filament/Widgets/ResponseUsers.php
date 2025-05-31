<?php

namespace App\Filament\Widgets;

use App\Models\Award;
use App\Models\User;
use Filament\Notifications\Notification;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class ResponseUsers extends BaseWidget
{
    protected static ?string $heading = 'Dias contestados por usuario';
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
                    ->withCount(['responses as days_count' => function (Builder $query) {
                        $query->select(DB::raw('COUNT(DISTINCT day_id)'));
                    }])
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
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('days_count')
                    ->label('Días respondidos')
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\Action::make('notification')
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
    public static function canView(): bool
    {
        return auth()->user()->can('widget_ResponseUsers');
    }
}
