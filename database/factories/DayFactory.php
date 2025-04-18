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
        return [
            'date_assigned' => date('Y-m-d'),
            'chapters' => 'Genesis 1 a Genesis 2',
            'day_month' => date('d').'/'.date('m')
        ];
    }
}
