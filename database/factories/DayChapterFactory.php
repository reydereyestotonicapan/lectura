<?php

namespace Database\Factories;

use App\Models\Day;
use App\Models\DayChapter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DayChapter>
 */
class DayChapterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'day_id' => Day::factory(),
            'book' => fake()->randomElement(DayChapter::getValidBookNames()),
            'chapter_number' => fake()->numberBetween(1, 50),
            'order' => fake()->numberBetween(0, 10),
        ];
    }

    /**
     * Set a specific book for the chapter.
     */
    public function book(string $book): static
    {
        return $this->state(fn (array $attributes) => [
            'book' => $book,
        ]);
    }

    /**
     * Set a specific chapter number.
     */
    public function chapterNumber(int $chapterNumber): static
    {
        return $this->state(fn (array $attributes) => [
            'chapter_number' => $chapterNumber,
        ]);
    }

    /**
     * Set a specific order.
     */
    public function order(int $order): static
    {
        return $this->state(fn (array $attributes) => [
            'order' => $order,
        ]);
    }

    /**
     * Associate with a specific day.
     */
    public function forDay(Day $day): static
    {
        return $this->state(fn (array $attributes) => [
            'day_id' => $day->id,
        ]);
    }
}
