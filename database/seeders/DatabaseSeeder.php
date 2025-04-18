<?php

namespace Database\Seeders;

use App\Models\Day;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a super admin user
        $user = User::factory()->create([
            'name' => 'Miguel',
            'email' => 'mmenchu@reydereyestotonicapan.org',
        ]);
        $role = Role::where('name', 'super_admin')->first()
            ?? Role::factory()->create();
        $user->assignRole($role);

        Day::factory()->create();
    }
}
