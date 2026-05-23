<?php

namespace App\Filament\Resources\WeeklyKidsReadingResource\Pages;

use App\Filament\Resources\WeeklyKidsReadingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListWeeklyKidsReadings extends ListRecords
{
    protected static string $resource = WeeklyKidsReadingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Crear Lectura'),
        ];
    }
}
