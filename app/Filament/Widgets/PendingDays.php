<?php

namespace App\Filament\Widgets;

use App\Filament\Pages\DailyResponse;
use App\Models\Day;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class PendingDays extends BaseWidget
{
    protected static ?string $heading = 'Dias pendientes de contestar';
    protected int | string | array $columnSpan = 'full';
    public function table(Table $table): Table
    {
        $userId = auth()->id();
        return $table
            ->query(
                Day::query()
                    ->whereNotIn('id', function ($query) use ($userId) {
                        $query->select('day_id')
                            ->from('responses')
                            ->where('user_id', $userId)
                            ->distinct();
                    })
                    ->whereMonth('date_assigned', now()->month)
                    ->whereYear('date_assigned', now()->year)
            )
            ->columns([
                Tables\Columns\TextColumn::make('day_month')
                ->label('Día'),
                Tables\Columns\TextColumn::make('chapters')
                ->label('Lectura del día'),
            ])
            ->recordUrl(
                fn (Day $day): string => DailyResponse::getUrl(['day_id' => $day->id]),
            )
            ->actions([
                Tables\Actions\Action::make('respond')
                ->label('Responder')
                ->url(fn (Day $day): string => DailyResponse::getUrl(['day_id' => $day->id])),
            ]);
    }
    public static function canView(): bool
    {
        return auth()->user()->can('widget_PendingDays');
    }
}
