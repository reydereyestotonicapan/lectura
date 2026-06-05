<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendDailyReadingNotificationsCommand extends Command
{
    protected $signature = 'notifications:send-daily-readings';

    protected $description = 'Send daily reading push notifications to eligible users';

    public function handle(NotificationService $service): void
    {
        $service->dispatchForTime(Carbon::now()->format('H:i'));
    }
}
