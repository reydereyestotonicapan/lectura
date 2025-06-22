<?php

namespace App\Enums;

enum AssetCondition: string
{
    case EXCELLENT = 'excellent';
    case GOOD = 'good';
    case FAIR = 'fair';
    case POOR = 'poor';

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
            self::EXCELLENT->value => 'Excelente',
            self::GOOD->value => 'Bueno',
            self::FAIR->value => 'Regular',
            self::POOR->value => 'Malo',
        ];
    }

    /**
     * Get the label for display
     */
    public function label(): string
    {
        return match($this) {
            self::EXCELLENT => 'Excelente',
            self::GOOD => 'Bueno',
            self::FAIR => 'Regular',
            self::POOR => 'Malo',
        };
    }

    /**
     * Get the color for condition badges
     */
    public function color(): string
    {
        return match($this) {
            self::EXCELLENT => 'success',
            self::GOOD => 'primary',
            self::FAIR => 'warning',
            self::POOR => 'danger',
        };
    }
}
