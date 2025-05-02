<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Question extends Model
{
    use HasFactory;
    protected $fillable = [
        'question',
    ];

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    public function day(): BelongsTo
    {
        return $this->belongsTo(Day::class);
    }
    public function correctAnswer(): HasOne
    {
        return $this->hasOne(Answer::class)->where('is_correct', true);
    }
}
