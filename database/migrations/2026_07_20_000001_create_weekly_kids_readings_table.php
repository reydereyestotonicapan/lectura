<?php

use App\Models\User;
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
        Schema::create('weekly_kids_readings', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('week_number');
            $table->unsignedSmallInteger('year');
            $table->string('title');
            $table->string('passage');
            $table->text('description')->nullable();
            $table->string('pdf_path')->nullable();
            $table->string('pdf_filename')->nullable();
            $table->boolean('is_published')->default(false);
            $table->foreignIdFor(User::class, 'created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Unique constraint on (week_number, year) - Requirement 7.1
            $table->unique(['week_number', 'year']);

            // Index on is_published for filtering - Requirement 7.1
            $table->index('is_published');

            // Composite index on (year, week_number) for ordering queries - Requirement 7.1
            $table->index(['year', 'week_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weekly_kids_readings');
    }
};
