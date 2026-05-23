<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeeklyKidsReading extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'week_number',
        'year',
        'title',
        'passage',
        'description',
        'pdf_path',
        'pdf_filename',
        'is_published',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'week_number' => 'integer',
            'year' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    /**
     * Get the user who created this reading.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the human-readable week label.
     * Returns format: "Semana X, YYYY"
     *
     * Validates: Requirements 7.4, 7.5
     */
    public function getWeekLabelAttribute(): string
    {
        return "Semana {$this->week_number}, {$this->year}";
    }

    /**
     * Scope a query to only include published readings.
     *
     * Validates: Requirements 4.1, 6.5
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope a query to order by year DESC, week_number DESC.
     *
     * Validates: Requirements 4.3
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('year', 'desc')
            ->orderBy('week_number', 'desc');
    }

    /**
     * Scope a query to find the current ISO week's reading.
     *
     * Validates: Requirements 8.1
     */
    public function scopeCurrentWeek(Builder $query): Builder
    {
        return $query->where('week_number', now()->isoWeek())
            ->where('year', now()->year);
    }
}
