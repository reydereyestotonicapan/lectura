<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminPermissions = [
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
            'view_any_category',
            'view_any_ministry',
            'view_any_asset',
        ];
        $adminPermissions = [
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
        $InventoryManagerPermissions = [
            'view_any_category',
            'view_any_ministry',
            'view_any_asset',
        ];

        // Get the roles
        $superAdminRole = Role::where('name', 'super_admin')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $InventoryAdminRole = Role::where('name', 'inventory_admin')->first();

        // If roles don't exist yet, create them
        if (!$superAdminRole) {
            $superAdminRole = Role::create(['name' => 'super_admin']);
        }
        if (!$adminRole) {
            $adminRole = Role::create(['name' => 'admin']);
        }
        if(!$InventoryAdminRole){
            $InventoryAdminRole = Role::create(['name' => 'inventory_admin']);
        }

        // Assign permissions to roles
        foreach ($superAdminPermissions as $permName) {
            if (!$superAdminRole->hasPermissionTo($permName)) {
                $superAdminRole->givePermissionTo($permName);
            }
        }
        foreach ($adminPermissions as $permName) {
            if (!$adminRole->hasPermissionTo($permName)) {
                $adminRole->givePermissionTo($permName);
            }
        }
        foreach ($InventoryManagerPermissions as $permName) {
            if (!$InventoryAdminRole->hasPermissionTo($permName)) {
                $InventoryAdminRole->givePermissionTo($permName);
            }
        }

        $this->call([
            DefaultUserSeeder::class
        ]);
    }
}
