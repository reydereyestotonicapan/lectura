<?php

namespace Database\Factories;

use App\Models\DayChapter;
use App\Models\User;
use App\Models\UserChapterProgress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserChapterProgress>
 */
class UserChapterProgressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'day_chapter_id' => DayChapter::factory(),
            'read_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ];
    }

    /**
     * Associate with a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn () => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Associate with a specific day chapter.
     */
    public function forDayChapter(DayChapter $dayChapter): static
    {
        return $this->state(fn () => [
            'day_chapter_id' => $dayChapter->id,
        ]);
    }

    /**
     * Set the read_at timestamp to now.
     */
    public function readNow(): static
    {
        return $this->state(fn () => [
            'read_at' => now(),
        ]);
    }

    /**
     * Set a specific read_at timestamp.
     */
    public function readAt(\DateTimeInterface $dateTime): static
    {
        return $this->state(fn () => [
            'read_at' => $dateTime,
        ]);
    }
}
