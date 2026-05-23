<?php

namespace App\Filament\Resources\WeeklyKidsReadingResource\Pages;

use App\Filament\Resources\WeeklyKidsReadingResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Auth;

class CreateWeeklyKidsReading extends CreateRecord
{
    protected static string $resource = WeeklyKidsReadingResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['created_by'] = Auth::id();

        return $data;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getCreatedNotificationTitle(): ?string
    {
        return 'Lectura creada exitosamente';
    }
}
