<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChapterProgressController;
use App\Http\Controllers\Api\ReadingController;
use App\Http\Controllers\Api\UserSettingsController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/firebase-login', [AuthController::class, 'firebaseLogin']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('hello', function () {
        return response()->json(['message' => 'Hello, authenticated user!']);
    });
    Route::get('/readings/today', [ReadingController::class, 'today']);
    Route::get('/readings', [ReadingController::class, 'index']);
    Route::get('/readings/{day}', [ReadingController::class, 'show']);
    Route::get('/readings/{day}/questions', [ReadingController::class, 'questions']);
    Route::post('/readings/{day}/answers', [ReadingController::class, 'submitAnswers']);
    Route::get('/profile', [ReadingController::class, 'profile']);
    Route::get('/responses', [ReadingController::class, 'responses']);

    // Chapter progress routes
    Route::get('/readings/{day}/chapters', [ChapterProgressController::class, 'show']);
    Route::post('/chapters/{chapter}/progress', [ChapterProgressController::class, 'markRead']);
    Route::delete('/chapters/{chapter}/progress', [ChapterProgressController::class, 'markUnread']);

    // User settings routes
    Route::get('/settings', [UserSettingsController::class, 'show']);
    Route::put('/settings', [UserSettingsController::class, 'update']);
});
