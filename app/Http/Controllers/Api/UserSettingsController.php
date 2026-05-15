<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserSettingsController extends Controller
{
    /**
     * Get the authenticated user's settings.
     *
     * Returns the user's current settings including bible_source preference.
     * Defaults to 'youversion' if no preference has been set.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'bible_source' => $user->bible_source,
                'bible_version' => $user->settings['bible_version'] ?? 'TLA',
            ],
        ]);
    }

    /**
     * Update the authenticated user's settings.
     *
     * Validates that bible_source is either 'youversion' or 'biblegateway'.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bible_source' => ['sometimes', Rule::in(['youversion', 'biblegateway'])],
            'bible_version' => ['sometimes', 'string', 'max:10'],
        ]);

        $user = $request->user();
        $settings = $user->settings;

        if (isset($validated['bible_source'])) {
            $settings['bible_source'] = $validated['bible_source'];
        }

        if (isset($validated['bible_version'])) {
            $settings['bible_version'] = $validated['bible_version'];
        }

        $user->settings = $settings;
        $user->save();

        return response()->json([
            'data' => [
                'bible_source' => $user->bible_source,
                'bible_version' => $user->settings['bible_version'] ?? 'TLA',
            ],
        ]);
    }
}
