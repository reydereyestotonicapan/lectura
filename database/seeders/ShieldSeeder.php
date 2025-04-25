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
        $role = Role::where('name', 'admin')->where('guard_name', 'web')->first();
        if (!$role) {
            $role = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        }
        $user = User::where('email', 'slopez@reydereyestotonicapan.org')->first();
        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Silhy',
                'email' => 'slopez@reydereyestotonicapan.org',
            ]);
        }



        if (!$user->hasRole($role)) {
            $user->assignRole($role);
        }

        $permissionNames = [
            'view_any_day',
            'create_day',
            'update_day',
        ];

        $existingPermissions = $role->permissions->pluck('name')->toArray();


        $newPermissions = [];
        foreach ($permissionNames as $permName) {
            if (!in_array($permName, $existingPermissions)) {
                $newPermissions[] = $permName;
            }
        }

        if (!empty($newPermissions)) {
            $newPermissionModels = Permission::whereIn('name', $newPermissions)->get();
            $role->givePermissionTo($newPermissionModels);
        }

        $this->call([
            PermissionsSeeder::class
        ]);
    }
}
