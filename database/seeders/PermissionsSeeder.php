<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $relationManagerPermissions = [
            'view_any_question',
            'create_question',
            'update_question',
        ];

        foreach ($relationManagerPermissions as $permission) {
            Permission::findOrCreate($permission);
        }
        $permissionModels = Permission::whereIn('name', $relationManagerPermissions)->get();

        // Get the roles
        $superAdminRole = Role::where('name', 'super_admin')->first();
        $adminRole = Role::where('name', 'admin')->first();

        // If roles don't exist yet, create them
        if (!$superAdminRole) {
            $superAdminRole = Role::create(['name' => 'super_admin']);
        }
        if (!$adminRole) {
            $adminRole = Role::create(['name' => 'admin']);
        }

        // Assign permissions to roles
        $superAdminRole->givePermissionTo($permissionModels);
        $adminRole->givePermissionTo($permissionModels);
    }
}
