<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Day;
use App\Models\Question;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a super admin user
        $user = User::factory()->create([
            'name' => 'Miguel',
            'email' => 'mmenchu@reydereyestotonicapan.org',
        ]);
        $role = Role::where('name', 'super_admin')->first()
            ?? Role::factory()->create();
        $user->assignRole($role);

        // Create first question with its answers
        $day = Day::factory()->create();

        $question1 = Question::factory()
            ->for($day)
            ->state([
                "question" => "¿Quién fué el hijo primogenito de Isaac?"
            ])
            ->create();

        Answer::factory()
            ->for($question1)
            ->createMany([
                ["description" => "Esaú", "is_correct" => true],
                ["description" => "Jacob", "is_correct" => false],
                ["description" => "Abraham", "is_correct" => false]
            ]);

        // Create second question without answers
        $question2 = Question::factory()
            ->for($day)
            ->state([
                "question" => "¿Qué le pareció la lectura del día de hoy?"
            ])
            ->create();
    }
}
