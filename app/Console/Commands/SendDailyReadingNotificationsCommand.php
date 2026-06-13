<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class SendDailyReadingNotificationsCommand extends Command
{
    protected $signature = 'notifications:send-daily-readings';

    protected $description = 'Send daily reading push notifications to eligible users';

    public function handle(NotificationService $service): void
    {
        $currentTime = Carbon::now()->format('H:i');
        $this->info("[notifications] Running at {$currentTime}");
        Log::info('[notifications] Command started', ['time' => $currentTime]);

        $service->dispatchForTime($currentTime);

        $this->info('[notifications] Done');
    }
}
