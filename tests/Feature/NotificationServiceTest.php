<?php

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['app.default_user_role' => null]); // no role to assign in these tests
});

it('clears the expo token when Expo reports DeviceNotRegistered', function () {
    Http::fake([
        'exp.host/*' => Http::response([
            'data' => [
                'status' => 'error',
                'message' => 'The recipient device is not registered.',
                'details' => ['error' => 'DeviceNotRegistered'],
            ],
        ], 200),
    ]);

    $user = User::factory()->create(['expo_push_token' => 'ExponentPushToken[dead]']);

    app(NotificationService::class)->sendToUser($user->expo_push_token, 'Hoy: Génesis 1', $user->id);

    expect($user->fresh()->expo_push_token)->toBeNull();
});

it('keeps the token when Expo accepts the push', function () {
    Http::fake([
        'exp.host/*' => Http::response([
            'data' => ['status' => 'ok', 'id' => '019ec213-2fee-774a-9992-191bc464d7c0'],
        ], 200),
    ]);

    $user = User::factory()->create(['expo_push_token' => 'ExponentPushToken[live]']);

    app(NotificationService::class)->sendToUser($user->expo_push_token, 'Hoy: Génesis 1', $user->id);

    expect($user->fresh()->expo_push_token)->toBe('ExponentPushToken[live]');
});

it('keeps the token when the request itself fails', function () {
    Http::fake([
        'exp.host/*' => Http::response('Service Unavailable', 503),
    ]);

    $user = User::factory()->create(['expo_push_token' => 'ExponentPushToken[live]']);

    app(NotificationService::class)->sendToUser($user->expo_push_token, 'Hoy: Génesis 1', $user->id);

    expect($user->fresh()->expo_push_token)->toBe('ExponentPushToken[live]');
});
