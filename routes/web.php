<?php

use App\Http\Controllers\WelcomeController;
use App\Models\Day;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

Route::view('/privacy-policy', 'privacy-policy')->name('privacy-policy');
Route::view('/account-deletion', 'account-deletion')->name('account-deletion');
