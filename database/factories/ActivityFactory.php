<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Ministry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'place' => fake()->address(),
            'scheduled_at' => fake()->dateTimeBetween('now', '+3 months'),
            'image' => null,
            'ministry_id' => Ministry::create([
                'ministry_name' => fake()->words(2, true),
                'led_by' => User::factory()->create()->id,
            ])->id,
            'created_by' => User::factory(),
        ];
    }
}
