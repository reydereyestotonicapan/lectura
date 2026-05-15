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
        Schema::create('user_chapter_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('day_chapter_id')->constrained('day_chapters')->cascadeOnDelete();
            $table->timestamp('read_at')->useCurrent();
            $table->timestamps();

            // Unique constraint to prevent duplicate progress records per user/chapter
            $table->unique(['user_id', 'day_chapter_id'], 'unique_user_chapter');

            // Composite index for efficient progress queries by user and time
            $table->index(['user_id', 'read_at'], 'idx_user_progress');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_chapter_progress');
    }
};
