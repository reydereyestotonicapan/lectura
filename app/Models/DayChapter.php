<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DayChapter extends Model
{
    use HasFactory;

    /**
     * YouVersion TLA version code
     */
    public const YOUVERSION_VERSION_CODE = 176;

    /**
     * Mapping of Spanish Bible book names to YouVersion book codes
     */
    public const BIBLE_BOOK_CODES = [
        // Old Testament
        'Génesis' => 'GEN',
        'Éxodo' => 'EXO',
        'Levítico' => 'LEV',
        'Números' => 'NUM',
        'Deuteronomio' => 'DEU',
        'Josué' => 'JOS',
        'Jueces' => 'JDG',
        'Rut' => 'RUT',
        '1 Samuel' => '1SA',
        '2 Samuel' => '2SA',
        '1 Reyes' => '1KI',
        '2 Reyes' => '2KI',
        '1 Crónicas' => '1CH',
        '2 Crónicas' => '2CH',
        'Esdras' => 'EZR',
        'Nehemías' => 'NEH',
        'Ester' => 'EST',
        'Job' => 'JOB',
        'Salmos' => 'PSA',
        'Proverbios' => 'PRO',
        'Eclesiastés' => 'ECC',
        'Cantares' => 'SNG',
        'Isaías' => 'ISA',
        'Jeremías' => 'JER',
        'Lamentaciones' => 'LAM',
        'Ezequiel' => 'EZK',
        'Daniel' => 'DAN',
        'Oseas' => 'HOS',
        'Joel' => 'JOL',
        'Amós' => 'AMO',
        'Abdías' => 'OBA',
        'Jonás' => 'JON',
        'Miqueas' => 'MIC',
        'Nahúm' => 'NAM',
        'Habacuc' => 'HAB',
        'Sofonías' => 'ZEP',
        'Hageo' => 'HAG',
        'Zacarías' => 'ZEC',
        'Malaquías' => 'MAL',
        // New Testament
        'Mateo' => 'MAT',
        'Marcos' => 'MRK',
        'Lucas' => 'LUK',
        'Juan' => 'JHN',
        'Hechos' => 'ACT',
        'Romanos' => 'ROM',
        '1 Corintios' => '1CO',
        '2 Corintios' => '2CO',
        'Gálatas' => 'GAL',
        'Efesios' => 'EPH',
        'Filipenses' => 'PHP',
        'Colosenses' => 'COL',
        '1 Tesalonicenses' => '1TH',
        '2 Tesalonicenses' => '2TH',
        '1 Timoteo' => '1TI',
        '2 Timoteo' => '2TI',
        'Tito' => 'TIT',
        'Filemón' => 'PHM',
        'Hebreos' => 'HEB',
        'Santiago' => 'JAS',
        '1 Pedro' => '1PE',
        '2 Pedro' => '2PE',
        '1 Juan' => '1JN',
        '2 Juan' => '2JN',
        '3 Juan' => '3JN',
        'Judas' => 'JUD',
        'Apocalipsis' => 'REV',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'day_id',
        'book',
        'chapter_number',
        'order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'chapter_number' => 'integer',
        'order' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'display_name',
        'youversion_reference',
        'biblegateway_url',
    ];

    /**
     * Get the day that owns this chapter.
     */
    public function day(): BelongsTo
    {
        return $this->belongsTo(Day::class);
    }

    /**
     * Get the user progress records for this chapter.
     */
    public function userProgress(): HasMany
    {
        return $this->hasMany(UserChapterProgress::class);
    }

    /**
     * Get the display name for the chapter (e.g., "Romanos 8").
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->book} {$this->chapter_number}";
    }

    /**
     * Get the YouVersion deep link reference for this chapter.
     * Format: youversion://bible?reference={bookCode}.{chapter}&version=176
     */
    public function getYouVersionReferenceAttribute(): string
    {
        $bookCode = self::BIBLE_BOOK_CODES[$this->book] ?? 'GEN';
        $versionCode = self::YOUVERSION_VERSION_CODE;

        return "youversion://bible?reference={$bookCode}.{$this->chapter_number}&version={$versionCode}";
    }

    /**
     * Get the BibleGateway URL for this chapter.
     * Format: https://www.biblegateway.com/passage/?search={book}%20{chapter}&version=TLA
     */
    public function getBibleGatewayUrlAttribute(): string
    {
        $encodedBook = urlencode($this->book);

        return "https://www.biblegateway.com/passage/?search={$encodedBook}%20{$this->chapter_number}&version=TLA";
    }

    /**
     * Get the YouVersion book code for this chapter's book.
     */
    public function getBookCodeAttribute(): ?string
    {
        return self::BIBLE_BOOK_CODES[$this->book] ?? null;
    }

    /**
     * Get all valid Spanish Bible book names.
     *
     * @return array<string>
     */
    public static function getValidBookNames(): array
    {
        return array_keys(self::BIBLE_BOOK_CODES);
    }
}
