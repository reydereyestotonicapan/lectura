<?php

use App\Models\Answer;
use App\Models\Day;
use App\Models\Question;
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
        Schema::create('responses', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class);
            $table->foreignIdFor(Day::class);
            $table->foreignIdFor(Question::class);
            $table->foreignIdFor(Answer::class)->nullable();
            $table->enum('status', ['Correcta', 'Incorrecta ', 'Pendiente'])->default('Pendiente');
            $table->text('comment_user')->nullable();
            $table->text('comment_team')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('responses');
    }
};
