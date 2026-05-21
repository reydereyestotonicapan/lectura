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
    config(['app.default_user_role' => null]); // no role to assign in unit tests

    $this->user = User::factory()->create([
        'name'  => 'Quiz User',
        'email' => 'quiz@example.com',
    ]);

    $this->day      = Day::factory()->today()->create();
    $this->question = Question::factory()->create(['day_id' => $this->day->id]);
    $this->correct  = Answer::factory()->correct()->create(['question_id' => $this->question->id]);
    $this->wrong    = Answer::factory()->create(['question_id' => $this->question->id]);
});

it('returns 422 when answers payload is missing', function () {
    $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/readings/{$this->day->id}/answers")
        ->assertStatus(422)
        ->assertJsonValidationErrors(['answers']);
});

it('records a correct answer and returns score 1 of 1', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/readings/{$this->day->id}/answers", [
            'answers' => [
                ['question_id' => $this->question->id, 'answer_id' => $this->correct->id],
            ],
        ]);

    $response->assertStatus(200)
        ->assertJsonFragment(['score' => 1, 'total' => 1]);

    $this->assertDatabaseHas('responses', [
        'user_id'     => $this->user->id,
        'question_id' => $this->question->id,
        'answer_id'   => $this->correct->id,
        'status'      => StatusResponse::EXPECTED->value,
    ]);
});

it('records a wrong answer and returns score 0 of 1', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/readings/{$this->day->id}/answers", [
            'answers' => [
                ['question_id' => $this->question->id, 'answer_id' => $this->wrong->id],
            ],
        ]);

    $response->assertStatus(200)
        ->assertJsonFragment(['score' => 0, 'total' => 1]);

    $this->assertDatabaseHas('responses', [
        'status' => StatusResponse::WRONG->value,
    ]);
});

it('skips a question that was already answered and does not create a duplicate response', function () {
    // Answer once
    Response::create([
        'user_id'     => $this->user->id,
        'day_id'      => $this->day->id,
        'question_id' => $this->question->id,
        'answer_id'   => $this->correct->id,
        'status'      => StatusResponse::EXPECTED,
    ]);

    // Try to answer the same question again
    $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/readings/{$this->day->id}/answers", [
            'answers' => [
                ['question_id' => $this->question->id, 'answer_id' => $this->wrong->id],
            ],
        ])
        ->assertStatus(200)
        ->assertJsonFragment(['skipped' => true]);

    // Still only one response row in DB
    $this->assertDatabaseCount('responses', 1);
});

it('includes correct_answer_id in each result', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/readings/{$this->day->id}/answers", [
            'answers' => [
                ['question_id' => $this->question->id, 'answer_id' => $this->wrong->id],
            ],
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('results.0.correct_answer_id', $this->correct->id);
});

it('includes correct_answer_id even for skipped questions', function () {
    Response::create([
        'user_id'     => $this->user->id,
        'day_id'      => $this->day->id,
        'question_id' => $this->question->id,
        'answer_id'   => $this->correct->id,
        'status'      => StatusResponse::EXPECTED,
    ]);

    $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/readings/{$this->day->id}/answers", [
            'answers' => [
                ['question_id' => $this->question->id, 'answer_id' => $this->wrong->id],
            ],
        ])
        ->assertStatus(200)
        ->assertJsonPath('results.0.correct_answer_id', $this->correct->id);
});

it('returns 401 for unauthenticated submission', function () {
    $this->postJson("/api/readings/{$this->day->id}/answers", [
        'answers' => [['question_id' => $this->question->id, 'answer_id' => $this->correct->id]],
    ])->assertStatus(401);
});
