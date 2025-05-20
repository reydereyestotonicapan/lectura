<?php

namespace App\Filament\Pages;
use App\Filament\Widgets\PendingDays;
use \Filament\Pages\Dashboard as FilamentDashboard;

class Dashboard extends FilamentDashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $title = 'Escritorio';
    protected static ?string $navigationLabel = 'Escritorio';

    public function getWidgets(): array
    {
        return [
            PendingDays::class,
        ];
    }
}
