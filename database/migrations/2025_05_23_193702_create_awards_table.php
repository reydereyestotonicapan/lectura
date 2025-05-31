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
        Schema::create('awards', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class);
            $table->date('month_date');
            $table->string('file_path', 255)->nullable();
            $table->string('file_name', 100)->nullable();
            $table->string('file_extension', 10)->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->string('disk', 20)->default('local');
            $table->string('directory', 100)->nullable();
            $table->enum('category', ['gold', 'silver', 'bronze'])->default('gold');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('awards');
    }
};
