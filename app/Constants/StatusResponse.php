<?php

namespace App\Constants;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum StatusResponse: string implements HasLabel, HasColor
{
    case EXPECTED = 'Correcta';
    case WRONG = 'Incorrecta';
    case PENDING = 'Pendiente';

    public function getLabel(): string
    {
        return $this->value;
    }
    public function getColor(): string
    {
        return match ($this) {
            self::EXPECTED => 'success',
            self::WRONG => 'danger',
            self::PENDING => 'warning',
            default => 'grey',
        };
    }
}
