<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Answer>
 */
class AnswerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'description' => $this->faker->sentence(5),
            'is_correct'  => false,
            'question_id' => \App\Models\Question::factory(),
        ];
    }

    public function correct(): static
    {
        return $this->state(['is_correct' => true]);
    }
}
