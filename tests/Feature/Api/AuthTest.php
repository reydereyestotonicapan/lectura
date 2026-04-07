<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;
use Lcobucci\JWT\Token\DataSet;
use Lcobucci\JWT\Token\Signature;
use Lcobucci\JWT\UnencryptedToken;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['app.default_user_role' => null]); // no role to assign in unit tests
});

it('returns 422 when firebase_token is missing', function () {
    $this->postJson('/api/auth/firebase-login')
        ->assertStatus(422)
        ->assertJsonValidationErrors(['firebase_token']);
});

it('returns 401 for an invalid firebase token', function () {
    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('verifyIdToken')
        ->once()
        ->andThrow(new \Exception('Token invalid'));

    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $this->postJson('/api/auth/firebase-login', ['firebase_token' => 'bad-token'])
        ->assertStatus(401)
        ->assertJson(['message' => 'Invalid or expired token.']);
});

it('creates a new user and returns a sanctum token on first login', function () {
    $uid   = 'firebase-uid-abc123';
    $email = 'newuser@example.com';
    $name  = 'New User';

    $mockToken = mockFirebaseToken($uid, $email, $name);

    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('verifyIdToken')->once()->andReturn($mockToken);

    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $response = $this->postJson('/api/auth/firebase-login', ['firebase_token' => 'valid-token']);

    $response->assertStatus(200)
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

    $this->assertDatabaseHas('users', ['firebase_uid' => $uid, 'email' => $email]);
});

it('returns a token for an existing user without creating a duplicate', function () {
    $uid  = 'firebase-uid-existing';
    $user = User::factory()->create([
        'name'         => 'Existing User',
        'email'        => 'existing@example.com',
        'firebase_uid' => $uid,
    ]);

    $mockToken = mockFirebaseToken($uid, 'existing@example.com', 'Existing User');

    $mockAuth = Mockery::mock(FirebaseAuth::class);
    $mockAuth->shouldReceive('verifyIdToken')->once()->andReturn($mockToken);

    $this->app->instance(FirebaseAuth::class, $mockAuth);

    $this->postJson('/api/auth/firebase-login', ['firebase_token' => 'valid-token'])
        ->assertStatus(200)
        ->assertJsonFragment(['email' => 'existing@example.com']);

    $this->assertDatabaseCount('users', 1);
});

// ---------------------------------------------------------------------------
// Helper: build a fake verified Firebase token with the given claims.
// Must implement UnencryptedToken because verifyIdToken() has that return type.
// ---------------------------------------------------------------------------
function mockFirebaseToken(string $uid, string $email, string $name): UnencryptedToken
{
    $claims = new DataSet(['sub' => $uid, 'email' => $email, 'name' => $name], '');
    $empty  = new DataSet([], '');

    return new class($claims, $empty) implements UnencryptedToken {
        public function __construct(private DataSet $claimsData, private DataSet $headersData) {}

        public function claims(): DataSet  { return $this->claimsData; }
        public function headers(): DataSet { return $this->headersData; }
        public function signature(): Signature { return new Signature('', ''); }
        public function payload(): string  { return 'fake.payload'; }

        public function isPermittedFor(string $audience): bool   { return true; }
        public function isIdentifiedBy(string $id): bool         { return true; }
        public function isRelatedTo(string $subject): bool        { return true; }
        public function hasBeenIssuedBy(string ...$issuers): bool { return true; }
        public function hasBeenIssuedBefore(\DateTimeInterface $now): bool { return true; }
        public function isMinimumTimeBefore(\DateTimeInterface $now): bool { return true; }
        public function isExpired(\DateTimeInterface $now): bool   { return false; }
        public function toString(): string { return 'fake.token.string'; }
    };
}
