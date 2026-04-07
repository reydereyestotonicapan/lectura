<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReadingController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/firebase-login', [AuthController::class, 'firebaseLogin']);

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
});
