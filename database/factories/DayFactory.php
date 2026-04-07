<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Day>
 */
class DayFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = fake()->unique()->dateTimeBetween('-2 years', '-1 day');

        return [
            'date_assigned' => $date->format('Y-m-d'),
            'chapters'      => 'Genesis 1 a Genesis 2',
            'day_month'     => $date->format('d/m'),
        ];
    }

    public function today(): static
    {
        return $this->state([
            'date_assigned' => now()->toDateString(),
            'day_month'     => now()->format('d/m'),
        ]);
    }
}
