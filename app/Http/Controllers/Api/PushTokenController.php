<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushTokenController extends Controller
{
    /**
     * Register or update the authenticated user's Expo push token.
     *
     * Stores the token on the user record so the backend can send
     * daily reading push notifications via the Expo Push API.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expo_push_token' => ['required', 'string', 'max:255'],
        ]);

        // A physical device has a single Expo token. Detach it from any other
        // account first so the device maps to exactly one user (the most
        // recent login). Otherwise every account ever logged in on this device
        // keeps the token and receives its own daily notification.
        User::where('expo_push_token', $validated['expo_push_token'])
            ->where('id', '!=', $request->user()->id)
            ->update(['expo_push_token' => null]);

        $request->user()->update([
            'expo_push_token' => $validated['expo_push_token'],
        ]);

        return response()->json(['data' => ['registered' => true]]);
    }
}
