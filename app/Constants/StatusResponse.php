<?php

namespace App\Constants;

use Filament\Support\Contracts\HasLabel;

enum StatusResponse: string implements HasLabel
{
    case EXPECTED = 'Correcta';
    case WRONG = 'Incorrecta';
    case PENDING = 'Pendiente';

    public function getLabel(): string
    {
        return $this->value;
    }
}
