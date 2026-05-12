<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class DevTokenSeeder extends Seeder
{
    /**
     * Create a dev API token for mobile app testing.
     * 
     * Run with: php artisan db:seed --class=DevTokenSeeder
     */
    public function run(): void
    {
        $user = User::where('email', 'mmenchu@compassion.com')->first();

        if (!$user) {
            $this->command->error('Dev user not found. Run DatabaseSeeder first.');
            return;
        }

        // Delete existing dev tokens
        $user->tokens()->where('name', 'dev-token')->delete();

        // Create a new token
        $token = $user->createToken('dev-token');

        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════════════');
        $this->command->info('  DEV TOKEN CREATED');
        $this->command->info('═══════════════════════════════════════════════════════════════');
        $this->command->info('');
        $this->command->info("  User:  {$user->name} ({$user->email})");
        $this->command->info("  Token: {$token->plainTextToken}");
        $this->command->info('');
        $this->command->info('  Copy this token to mobile/src/auth/AuthContext.tsx');
        $this->command->info('═══════════════════════════════════════════════════════════════');
        $this->command->info('');

        // Also log it for easy retrieval
        Log::info('Dev token created', [
            'user_id' => $user->id,
            'email' => $user->email,
            'token' => $token->plainTextToken,
        ]);
    }
}
