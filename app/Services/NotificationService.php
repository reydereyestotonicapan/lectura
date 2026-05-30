<?php

namespace App\Services;

use App\Models\Day;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public const string EXPO_PUSH_URL = 'https://exp.host/--/push/send';
    public const string NOTIFICATION_TITLE = 'Lectura del día';
    public const string NOTIFICATION_SCREEN = 'TodayScreen';

    /**
     * Dispatch daily reading notifications to all eligible users
     * whose notification_time matches the given time string (HH:MM).
     */
    public function dispatchForTime(string $currentTime): void
    {
        $day = Day::whereDate('date_assigned', Carbon::today())->first();

        if ($day === null) {
            return; // Requirement 3.6: skip silently when no Day exists
        }

        $chapters = $day->dayChapters()->orderBy('order')->get();
        $body = 'Hoy: '.$chapters->pluck('display_name')->join(', ');

        $users = $this->getEligibleUsers($currentTime);

        foreach ($users as $user) {
            $this->sendToUser($user->expo_push_token, $body, $user->id);
        }
    }

    /**
     * Query users who are eligible to receive a notification at the given time.
     * Eligible = has a token + notifications_enabled is not false + notification_time matches.
     */
    public function getEligibleUsers(string $currentTime): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereNotNull('expo_push_token')
            ->get()
            ->filter(function (User $user) use ($currentTime) {
                $enabled = $user->settings['notifications_enabled'] ?? true;
                $time = $user->settings['notification_time'] ?? '07:00';

                return $enabled && $time === $currentTime;
            });
    }

    /**
     * Compose and send a single push notification via the Expo Push API.
     */
    public function sendToUser(string $token, string $body, int $userId): void
    {
        $payload = [
            'to' => $token,
            'title' => self::NOTIFICATION_TITLE,
            'body' => $body,
            'data' => ['screen' => self::NOTIFICATION_SCREEN],
        ];

        $response = Http::post(self::EXPO_PUSH_URL, $payload);

        if (! $response->successful()) {
            Log::error('Expo push notification failed', [
                'user_id' => $userId,
                'response_body' => $response->body(),
            ]);
        }
    }
}
