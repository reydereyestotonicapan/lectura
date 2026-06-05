<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChapterProgressController;
use App\Http\Controllers\Api\DeleteAccountController;
use App\Http\Controllers\Api\KidsReadingController;
use App\Http\Controllers\Api\PushTokenController;
use App\Http\Controllers\Api\ReadingController;
use App\Http\Controllers\Api\UserSettingsController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/firebase-login', [AuthController::class, 'firebaseLogin']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);

// Public routes — accessible without auth (guests), but honour token when present
Route::get('/readings/today', [ReadingController::class, 'today']);
Route::get('/readings/{day}/questions', [ReadingController::class, 'questions']);
Route::get('/readings/{day}/chapters', [ChapterProgressController::class, 'show']);

// Kids readings public routes (no auth required)
Route::get('/kids-readings', [KidsReadingController::class, 'index']);
Route::get('/kids-readings/current', [KidsReadingController::class, 'current']);
Route::get('/kids-readings/{reading}', [KidsReadingController::class, 'show']);
Route::get('/kids-readings/{reading}/download', [KidsReadingController::class, 'download']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('hello', function () {
        return response()->json(['message' => 'Hello, authenticated user!']);
    });
    Route::get('/readings', [ReadingController::class, 'index']);
    Route::get('/readings/{day}', [ReadingController::class, 'show']);
    Route::post('/readings/{day}/answers', [ReadingController::class, 'submitAnswers']);
    Route::get('/profile', [ReadingController::class, 'profile']);
    Route::get('/responses', [ReadingController::class, 'responses']);

    // Chapter progress write routes
    Route::post('/chapters/{chapter}/progress', [ChapterProgressController::class, 'markRead']);
    Route::delete('/chapters/{chapter}/progress', [ChapterProgressController::class, 'markUnread']);

    // User settings routes
    Route::get('/settings', [UserSettingsController::class, 'show']);
    Route::put('/settings', [UserSettingsController::class, 'update']);

    // Push token registration
    Route::put('/push-token', [PushTokenController::class, 'update']);

    // Account deletion
    Route::delete('/account', [DeleteAccountController::class, 'destroy']);
});
