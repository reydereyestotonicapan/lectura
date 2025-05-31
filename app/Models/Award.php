<?php

namespace App\Models;

use App\Jobs\GenerateAward;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Award extends Model
{
    protected $fillable = [
        'user_id',
        'month_date',
        'file_path',
        'file_name',
        'file_extension',
        'mime_type',
        'disk',
        'directory',
        'category',
        'days_count'
    ];
    protected static function booted(): void
    {
        static::creating(function (Award $award) {
            $award->month_date = now()->format('Y-m-d');
        });

        static::created(function (Award $award) {
            GenerateAward::dispatch($award);
        });
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
