<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('day_chapters', function (Blueprint $table) {
            $table->string('youtube_link')->nullable()->after('order');
        });
    }

    public function down(): void
    {
        Schema::table('day_chapters', function (Blueprint $table) {
            $table->dropColumn('youtube_link');
        });
    }
};
