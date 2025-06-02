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
        $this->call([
            PermissionsSeeder::class
        ]);
    }
}
