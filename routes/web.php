<?php

use App\Http\Controllers\WelcomeController;
use App\Models\Day;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');
