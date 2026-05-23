<?php

namespace App\Filament\Resources\WeeklyKidsReadingResource\Pages;

use App\Filament\Resources\WeeklyKidsReadingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditWeeklyKidsReading extends EditRecord
{
    protected static string $resource = WeeklyKidsReadingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getSavedNotificationTitle(): ?string
    {
        return 'Lectura actualizada exitosamente';
    }

    /**
     * Filament 3 FileUpload component automatically preserves existing files
     * when no new file is uploaded. The pdf_path field will retain its value
     * unless explicitly cleared or replaced with a new upload.
     *
     * This behavior satisfies Requirement 2.2:
     * "WHEN an admin updates a reading, THE System SHALL save the changes
     * and preserve the existing PDF unless a new one is uploaded"
     */
}
