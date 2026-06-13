<?php

use App\Services\NotificationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Dispatch the daily reading notifications in-process via a closure rather
// than Schedule::command(). The scheduler runs spawned commands with their
// output redirected to /dev/null, which swallows the NotificationService
// Log lines. Running it inline keeps those logs on the scheduler process's
// stderr, so they show up in the platform logs (e.g. Railway).
Schedule::call(function (NotificationService $service) {
    $service->dispatchForTime(Carbon::now()->format('H:i'));
})
    ->name('send-daily-readings')
    ->everyMinute()
    ->withoutOverlapping();
