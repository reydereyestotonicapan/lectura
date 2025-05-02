<?php

namespace App\Models;

use App\Constants\StatusResponse;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Response extends Model
{
    /** @use HasFactory<\Database\Factories\ResponseFactory> */
    use HasFactory;

    protected $casts = [
        'status' => StatusResponse::class,
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function day(): BelongsTo
    {
        return $this->belongsTo(Day::class);
    }
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
    public function answer(): BelongsTo
    {
        return $this->belongsTo(Answer::class);
    }
}
