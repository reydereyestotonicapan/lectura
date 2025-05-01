<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Answer extends Model
{
    /** @use HasFactory<\Database\Factories\AnswerFactory> */
    use HasFactory;
    protected $fillable = [
        'description',
        'is_correct',
    ];
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
    public static function isCorrect(int $questionId, int $answerId): bool
    {
        return self::query()
            ->where('question_id', $questionId)
            ->where('id', $answerId)
            ->where('is_correct', true)
            ->exists();
    }
}
