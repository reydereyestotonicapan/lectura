<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('day_chapters', function (Blueprint $table) {
            // Nullable verse range within a chapter. NULL = whole chapter.
            $table->unsignedInteger('verse_start')->nullable()->after('chapter_number');
            $table->unsignedInteger('verse_end')->nullable()->after('verse_start');
        });

        // Widen the uniqueness to include verse_start so two portions of the
        // same chapter (e.g. Salmos 119:1-88 and 89-176) can coexist if ever
        // assigned to the same day.
        Schema::table('day_chapters', function (Blueprint $table) {
            $table->dropUnique('unique_day_chapter');
            $table->unique(['day_id', 'book', 'chapter_number', 'verse_start'], 'unique_day_chapter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('day_chapters', function (Blueprint $table) {
            $table->dropUnique('unique_day_chapter');
            $table->unique(['day_id', 'book', 'chapter_number'], 'unique_day_chapter');
        });

        Schema::table('day_chapters', function (Blueprint $table) {
            $table->dropColumn(['verse_start', 'verse_end']);
        });
    }
};
