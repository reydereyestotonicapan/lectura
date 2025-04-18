<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use BezhanSalleh\FilamentShield\Support\Utils;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class ShieldSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        // Create admin role
        $role = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $user = User::factory()->create([
            'name' => 'Silhy',
            'email' => 'slopez@reydereyestotonicapan.org',
        ]);
        $user->assignRole($role);
        // Assign specific permissions
        $permissions = Permission::whereIn('name', [
            'view_any_day',
            'create_day',
            'update_day'
        ])->get();
        $role->syncPermissions($permissions);
    }
}
