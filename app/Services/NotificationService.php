<?php

namespace App\Services;

use App\Models\Day;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public const string EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

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
            Log::info('[notifications] No Day record found for today, skipping', [
                'date' => Carbon::today()->toDateString(),
            ]);

            return;
        }

        $chapters = $day->dayChapters()->orderBy('order')->get();
        $body = 'Hoy: '.$chapters->pluck('display_name')->join(', ');

        Log::info('[notifications] Day found', [
            'day_id' => $day->id,
            'date' => $day->date_assigned,
            'chapters' => $chapters->count(),
            'body' => $body,
        ]);

        $users = $this->getEligibleUsers($currentTime);

        Log::info('[notifications] Eligible users', [
            'time' => $currentTime,
            'count' => $users->count(),
            'ids' => $users->pluck('id'),
        ]);

        if ($users->isEmpty()) {
            Log::info('[notifications] No eligible users for this time slot', ['time' => $currentTime]);

            return;
        }

        foreach ($users as $user) {
            $this->sendToUser($user->expo_push_token, $body, $user->id);
        }
    }

    /**
     * Query users who are eligible to receive a notification at the given time.
     * Eligible = has a token + notifications_enabled is not false + notification_time matches.
     */
    public function getEligibleUsers(string $currentTime): Collection
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

        Log::info('[notifications] Sending to user', [
            'user_id' => $userId,
            'token' => $token,
        ]);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post(self::EXPO_PUSH_URL, $payload);

        Log::info('[notifications] Expo API response', [
            'user_id' => $userId,
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        if (! $response->successful()) {
            Log::error('[notifications] Expo push notification failed', [
                'user_id' => $userId,
                'response_body' => $response->body(),
            ]);

            return;
        }

        // Expo returns HTTP 200 even for bad tokens; the real per-ticket
        // outcome lives in the response body. Inspect it and prune tokens
        // for devices that are gone so we stop sending to them every run.
        $ticket = $response->json('data');

        if (is_array($ticket) && ($ticket['status'] ?? null) === 'error') {
            $error = $ticket['details']['error'] ?? null;

            Log::error('[notifications] Expo ticket error', [
                'user_id' => $userId,
                'error' => $error,
                'message' => $ticket['message'] ?? null,
            ]);

            if ($error === 'DeviceNotRegistered') {
                User::whereKey($userId)->update(['expo_push_token' => null]);

                Log::info('[notifications] Cleared dead expo token', ['user_id' => $userId]);
            }
        }
    }
}
