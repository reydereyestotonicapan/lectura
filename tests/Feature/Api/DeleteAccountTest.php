<?php

use App\Models\Day;
use App\Models\DayChapter;
use App\Models\Response;
use App\Models\User;
use App\Models\UserChapterProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['app.default_user_role' => null]); // no role to assign in unit tests
});

// ---------------------------------------------------------------------------
// Helper: create a user with required fields
// ---------------------------------------------------------------------------

function makeUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'name'  => 'Test User',
        'email' => fake()->unique()->safeEmail(),
    ], $overrides));
}

// ---------------------------------------------------------------------------
// Unauthenticated request
// ---------------------------------------------------------------------------

it('returns 401 when the request is not authenticated', function () {
    $this->deleteJson('/api/account')
        ->assertStatus(401);
});

// ---------------------------------------------------------------------------
// Successful deletion
// ---------------------------------------------------------------------------

it('returns 200 with a message when the account is deleted successfully', function () {
    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('deleteUser')->never();
    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $user = makeUser(['firebase_uid' => null]);

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/account')
        ->assertStatus(200)
        ->assertJson(['message' => 'Cuenta eliminada correctamente.']);
});

it('removes the user record from the database after deletion', function () {
    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('deleteUser')->never();
    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $user   = makeUser(['firebase_uid' => null]);
    $userId = $user->id;

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/account')
        ->assertStatus(200);

    $this->assertDatabaseMissing('users', ['id' => $userId]);
});

it('revokes all sanctum tokens when the account is deleted', function () {
    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('deleteUser')->never();
    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $user = makeUser(['firebase_uid' => null]);
    $user->createToken('mobile-app');
    $user->createToken('another-device');

    $this->assertDatabaseCount('personal_access_tokens', 2);

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/account')
        ->assertStatus(200);

    $this->assertDatabaseCount('personal_access_tokens', 0);
});

// ---------------------------------------------------------------------------
// Firebase integration
// ---------------------------------------------------------------------------

it('calls Firebase deleteUser when the user has a firebase_uid', function () {
    $firebaseUid = 'firebase-uid-to-delete';

    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('deleteUser')
        ->once()
        ->with($firebaseUid);
    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $user = makeUser(['firebase_uid' => $firebaseUid]);

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/account')
        ->assertStatus(200);
});

it('does not call Firebase SDK when the user has no firebase_uid', function () {
    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('deleteUser')->never();
    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $user = makeUser(['firebase_uid' => null]);

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/account')
        ->assertStatus(200);
});

it('still deletes the user and returns 200 when Firebase SDK throws an exception', function () {
    $firebaseUid = 'firebase-uid-failing';

    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('deleteUser')
        ->once()
        ->andThrow(new \Exception('Firebase unavailable'));
    $this->app->instance(FirebaseAuth::class, $mockAuth);

    Log::shouldReceive('error')->once();

    $user   = makeUser(['firebase_uid' => $firebaseUid]);
    $userId = $user->id;

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/account')
        ->assertStatus(200)
        ->assertJson(['message' => 'Cuenta eliminada correctamente.']);

    $this->assertDatabaseMissing('users', ['id' => $userId]);
});

// ---------------------------------------------------------------------------
// Cascade / related data deletion
// ---------------------------------------------------------------------------

it('deletes all responses belonging to the user', function () {
    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('deleteUser')->never();
    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $user = makeUser(['firebase_uid' => null]);

    // Create a minimal Day/Question/Answer chain so Response FK constraints are satisfied
    $day      = Day::factory()->create();
    $question = \App\Models\Question::factory()->create(['day_id' => $day->id]);
    $answer   = \App\Models\Answer::factory()->create(['question_id' => $question->id]);

    Response::factory()->count(3)->create([
        'user_id'     => $user->id,
        'day_id'      => $day->id,
        'question_id' => $question->id,
        'answer_id'   => $answer->id,
    ]);

    $this->assertDatabaseCount('responses', 3);

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/account')
        ->assertStatus(200);

    $this->assertDatabaseCount('responses', 0);
});

it('deletes all user_chapter_progress records belonging to the user', function () {
    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('deleteUser')->never();
    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $user    = makeUser(['firebase_uid' => null]);
    $day     = Day::factory()->create();
    $chapter = DayChapter::factory()->create(['day_id' => $day->id]);

    UserChapterProgress::factory()->create([
        'user_id'        => $user->id,
        'day_chapter_id' => $chapter->id,
    ]);

    $this->assertDatabaseCount('user_chapter_progress', 1);

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/account')
        ->assertStatus(200);

    $this->assertDatabaseCount('user_chapter_progress', 0);
});
