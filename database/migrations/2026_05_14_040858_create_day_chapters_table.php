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
        Schema::create('day_chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('day_id')->constrained('days')->cascadeOnDelete();
            $table->string('book', 50);
            $table->unsignedInteger('chapter_number');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            // Unique constraint to prevent duplicate chapters per day
            $table->unique(['day_id', 'book', 'chapter_number'], 'unique_day_chapter');

            // Index for efficient ordering queries
            $table->index(['day_id', 'order'], 'idx_day_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('day_chapters');
    }
};
