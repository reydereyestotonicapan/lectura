<?php

namespace App\Enums;

enum AssetStatus: string
{
    case IN_USE = 'in_use';
    case IN_STORAGE = 'in_storage';
    case UNDER_REPAIR = 'under_repair';
    case DONATED = 'donated';
    case DISPOSED = 'disposed';

    /**
     * Get all enum values as array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get enum options for forms/selects
     */
    public static function options(): array
    {
        return [
            self::IN_USE->value => 'En Uso',
            self::IN_STORAGE->value => 'En Almacén',
            self::UNDER_REPAIR->value => 'En Reparación',
            self::DONATED->value => 'Donado',
            self::DISPOSED->value => 'Desechado',
        ];
    }

    /**
     * Get the label for display
     */
    public function label(): string
    {
        return match($this) {
            self::IN_USE => 'En Uso',
            self::IN_STORAGE => 'En Almacén',
            self::UNDER_REPAIR => 'En Reparación',
            self::DONATED => 'Donado',
            self::DISPOSED => 'Desechado',
        };
    }
}
