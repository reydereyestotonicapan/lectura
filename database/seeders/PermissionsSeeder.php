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
            'view_any_day',
            'create_day',
            'update_day',
            'view_any_question',
            'create_question',
            'update_question',
            'page_DailyResponse',
            'view_any_user',
            'update_user',
            'widget_PendingDays',
            'widget_ResponseUsers',
        ];

        foreach ($relationManagerPermissions as $permission) {
            Permission::findOrCreate($permission);
        }

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
        foreach ($relationManagerPermissions as $permName) {
            if (!$superAdminRole->hasPermissionTo($permName)) {
                $superAdminRole->givePermissionTo($permName);
            }
            if (!$adminRole->hasPermissionTo($permName)) {
                $adminRole->givePermissionTo($permName);
            }
        }
        $this->call([
            DefaultUserSeeder::class
        ]);
    }
}
