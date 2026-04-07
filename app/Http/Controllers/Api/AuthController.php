<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Kreait\Firebase\Contract\Auth;

class AuthController extends Controller
{
    public function __construct(private readonly Auth $auth) {}

    public function firebaseLogin(Request $request): JsonResponse
    {
        $request->validate(['firebase_token' => 'required|string']);

        try {
            $verifiedToken = $this->auth->verifyIdToken($request->firebase_token);
        } catch (\Throwable $e) {
            Log::warning('Firebase token verification failed: ' . $e->getMessage());
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        $claims = $verifiedToken->claims();
        $uid    = $claims->get('sub');
        $email  = $claims->get('email');
        $name   = $claims->get('name') ?? $email;

        $user = User::firstOrCreate(
            ['firebase_uid' => $uid],
            [
                'name'     => $name,
                'email'    => $email,
                'password' => bcrypt(Str::random(32)),
            ]
        );

        // Sync email in case it changed in Firebase
        if ($user->email !== $email) {
            $user->update(['email' => $email]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
