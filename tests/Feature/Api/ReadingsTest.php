<?php

use App\Models\Answer;
use App\Models\Day;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['app.default_user_role' => null]); // role doesn't exist in test DB
    $this->user = User::factory()->create([
        'name'  => 'Test User',
        'email' => 'test@example.com',
    ]);
});

// ---------------------------------------------------------------------------
// GET /api/readings/today
// ---------------------------------------------------------------------------

it('returns 401 for unauthenticated requests to today', function () {
    $this->getJson('/api/readings/today')->assertStatus(401);
});

it('returns 404 when there is no reading assigned for today', function () {
    Day::factory()->count(2)->create(); // past days, not today
    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings/today')
        ->assertStatus(404);
});

it('returns today\'s reading with questions and answers (no is_correct)', function () {
    $day      = Day::factory()->today()->create();
    $question = Question::factory()->create(['day_id' => $day->id]);
    Answer::factory()->correct()->create(['question_id' => $question->id]);
    Answer::factory()->create(['question_id' => $question->id]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings/today');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['id', 'date_assigned', 'chapters', 'day_month', 'questions'],
        ]);

    // is_correct must never appear in the response
    $this->assertStringNotContainsString('is_correct', $response->content());
});

// ---------------------------------------------------------------------------
// GET /api/readings
// ---------------------------------------------------------------------------

it('returns a paginated list of days', function () {
    Day::factory()->count(3)->create();

    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings')
        ->assertStatus(200)
        ->assertJsonStructure(['data', 'meta']);
});

// ---------------------------------------------------------------------------
// GET /api/readings/{day}
// ---------------------------------------------------------------------------

it('returns a single day by id', function () {
    $day = Day::factory()->create();

    $this->actingAs($this->user, 'sanctum')
        ->getJson("/api/readings/{$day->id}")
        ->assertStatus(200)
        ->assertJsonFragment(['id' => $day->id]);
});

it('returns 404 for a non-existent day', function () {
    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings/9999')
        ->assertStatus(404);
});

// ---------------------------------------------------------------------------
// GET /api/readings/{day}/questions
// ---------------------------------------------------------------------------

it('returns questions for a day without is_correct', function () {
    $day      = Day::factory()->create();
    $question = Question::factory()->create(['day_id' => $day->id]);
    Answer::factory()->correct()->create(['question_id' => $question->id]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson("/api/readings/{$day->id}/questions");

    $response->assertStatus(200)
        ->assertJsonStructure(['data' => [['id', 'description', 'answers']]]);

    $this->assertStringNotContainsString('is_correct', $response->content());
});

// ---------------------------------------------------------------------------
// GET /api/profile
// ---------------------------------------------------------------------------

it('returns the authenticated user profile', function () {
    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/profile')
        ->assertStatus(200)
        ->assertJsonFragment(['email' => 'test@example.com']);
});
