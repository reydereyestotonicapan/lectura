<?php

use App\Constants\StatusResponse;
use App\Models\Answer;
use App\Models\Day;
use App\Models\Question;
use App\Models\Response;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['app.default_user_role' => null]); // role doesn't exist in test DB
    $this->user = User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);
});

// ---------------------------------------------------------------------------
// GET /api/readings/today
// ---------------------------------------------------------------------------

it('returns 404 for unauthenticated requests to today when no day exists', function () {
    // /api/readings/today is a public route (no auth required); with no Day for today it returns 404
    $this->getJson('/api/readings/today')->assertStatus(404);
});

it('returns 404 when there is no reading assigned for today', function () {
    Day::factory()->count(2)->create(); // past days, not today
    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings/today')
        ->assertStatus(404);
});

it('returns today\'s reading with questions and answers (no is_correct)', function () {
    $day = Day::factory()->today()->create();
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
// GET /api/readings/by-date/{date?}
// ---------------------------------------------------------------------------

it('returns a day by date with prev and next neighbor dates', function () {
    $prev = Day::factory()->create(['date_assigned' => '2026-07-26']);
    $current = Day::factory()->create(['date_assigned' => '2026-07-27']);
    $next = Day::factory()->create(['date_assigned' => '2026-07-28']);

    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings/by-date/2026-07-27')
        ->assertStatus(200)
        ->assertJsonPath('data.id', $current->id)
        ->assertJsonPath('prev_date', '2026-07-26')
        ->assertJsonPath('next_date', '2026-07-28');
});

it('has null neighbors at the plan edges', function () {
    $only = Day::factory()->create(['date_assigned' => '2026-07-27']);

    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings/by-date/2026-07-27')
        ->assertStatus(200)
        ->assertJsonPath('prev_date', null)
        ->assertJsonPath('next_date', null);
});

it('defaults by-date to today when no date is given', function () {
    $today = Day::factory()->create(['date_assigned' => today()->toDateString()]);

    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings/by-date')
        ->assertStatus(200)
        ->assertJsonPath('data.id', $today->id);
});

it('returns 404 for a date with no reading', function () {
    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings/by-date/2030-01-01')
        ->assertStatus(404);
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

it('lists only upcoming readings with scope=upcoming', function () {
    $past = Day::factory()->create(['date_assigned' => now()->subDays(3)->toDateString()]);
    $today = Day::factory()->create(['date_assigned' => today()->toDateString()]);
    $future = Day::factory()->create(['date_assigned' => now()->addDays(3)->toDateString()]);

    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings?scope=upcoming')
        ->assertStatus(200)
        ->assertJsonFragment(['id' => $future->id])
        ->assertJsonMissing(['id' => $past->id])
        ->assertJsonMissing(['id' => $today->id]);
});

// ---------------------------------------------------------------------------
// GET /api/readings/progress
// ---------------------------------------------------------------------------

it('returns monthly progress with distinct answered days and current category', function () {
    // Two reading days this month (distinct dates); user answers questions on both.
    $days = collect([today()->startOfMonth(), today()->startOfMonth()->addDay()])
        ->map(fn ($date) => Day::factory()->create(['date_assigned' => $date->toDateString()]));
    // A day in the previous month should not count toward this month.
    Day::factory()->create(['date_assigned' => today()->startOfMonth()->subDay()->toDateString()]);

    foreach ($days as $day) {
        $question = Question::factory()->create(['day_id' => $day->id]);
        $answer = Answer::factory()->correct()->create(['question_id' => $question->id]);
        Response::create([
            'user_id' => $this->user->id,
            'day_id' => $day->id,
            'question_id' => $question->id,
            'answer_id' => $answer->id,
            'status' => StatusResponse::EXPECTED,
        ]);
    }

    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/readings/progress')
        ->assertStatus(200)
        ->assertJson([
            'days_answered' => 2,
            'days_in_month' => 2,
            'category' => 'bronze',
        ])
        ->assertJsonStructure(['month', 'silver_threshold', 'gold_threshold']);
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

it('includes questions_count and answered_count on a single day', function () {
    $day = Day::factory()->create();
    $q1 = Question::factory()->create(['day_id' => $day->id]);
    Question::factory()->create(['day_id' => $day->id]);
    $answer = Answer::factory()->correct()->create(['question_id' => $q1->id]);

    // User has answered one of the two questions.
    Response::create([
        'user_id' => $this->user->id,
        'day_id' => $day->id,
        'question_id' => $q1->id,
        'answer_id' => $answer->id,
        'status' => StatusResponse::EXPECTED,
    ]);

    $this->actingAs($this->user, 'sanctum')
        ->getJson("/api/readings/{$day->id}")
        ->assertStatus(200)
        ->assertJsonFragment(['questions_count' => 2, 'answered_count' => 1]);
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
    $day = Day::factory()->create();
    $question = Question::factory()->create(['day_id' => $day->id]);
    Answer::factory()->correct()->create(['question_id' => $question->id]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson("/api/readings/{$day->id}/questions");

    $response->assertStatus(200)
        ->assertJsonStructure(['data' => [['id', 'description', 'answers']]]);

    $this->assertStringNotContainsString('is_correct', $response->content());
});

// ---------------------------------------------------------------------------
// GET /api/results/days  &  GET /api/responses?day=
// ---------------------------------------------------------------------------

it('lists answered days with per-day result summaries', function () {
    // Day A: one correct, one pending. Day B: one incorrect. Day C: no answers.
    $dayA = Day::factory()->create(['date_assigned' => '2026-07-27']);
    $dayB = Day::factory()->create(['date_assigned' => '2026-07-26']);
    Day::factory()->create(['date_assigned' => '2026-07-25']); // unanswered -> excluded

    $answerFor = function (Day $day, StatusResponse $status) {
        $question = Question::factory()->create(['day_id' => $day->id]);
        $answer = Answer::factory()->create(['question_id' => $question->id]);
        Response::create([
            'user_id' => $this->user->id,
            'day_id' => $day->id,
            'question_id' => $question->id,
            'answer_id' => $answer->id,
            'status' => $status,
        ]);
    };

    $answerFor($dayA, StatusResponse::EXPECTED);
    $answerFor($dayA, StatusResponse::PENDING);
    $answerFor($dayB, StatusResponse::WRONG);

    $res = $this->actingAs($this->user, 'sanctum')->getJson('/api/results/days');

    $res->assertStatus(200)
        ->assertJsonPath('meta.total', 2) // only answered days
        ->assertJsonPath('data.0.id', $dayA->id) // newest first
        ->assertJsonPath('data.0.answered_count', 2)
        ->assertJsonPath('data.0.correct_count', 1)
        ->assertJsonPath('data.0.pending_count', 1)
        ->assertJsonPath('data.1.id', $dayB->id)
        ->assertJsonPath('data.1.correct_count', 0);
});

it('filters responses to a single day', function () {
    $dayA = Day::factory()->create(['date_assigned' => '2026-07-27']);
    $dayB = Day::factory()->create(['date_assigned' => '2026-07-26']);

    foreach ([$dayA, $dayB] as $day) {
        $question = Question::factory()->create(['day_id' => $day->id]);
        $answer = Answer::factory()->create(['question_id' => $question->id]);
        Response::create([
            'user_id' => $this->user->id,
            'day_id' => $day->id,
            'question_id' => $question->id,
            'answer_id' => $answer->id,
            'status' => StatusResponse::EXPECTED,
        ]);
    }

    $res = $this->actingAs($this->user, 'sanctum')->getJson("/api/responses?day={$dayA->id}");

    $res->assertStatus(200)->assertJsonPath('meta.total', 1);
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
