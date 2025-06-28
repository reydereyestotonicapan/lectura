<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Day extends Model
{
    use HasFactory;
    protected $fillable = [
        'date_assigned',
        'chapters',
        'day_month'
    ];
    protected $casts = [
        'date_assigned' => 'date',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
