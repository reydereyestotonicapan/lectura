<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class DefaultUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultUserPermissions = [
            'page_DailyResponse',
            'widget_PendingDays',
        ];
        foreach ($defaultUserPermissions as $permission) {
            Permission::findOrCreate($permission);
        }
        $permissionModels = Permission::whereIn('name', $defaultUserPermissions)->get();
        $defaultUserRole = Role::where('name', 'default_user')->first();

        foreach ($permissionModels as $permission) {
            if (!$defaultUserRole->hasPermissionTo($permission)) {
                $defaultUserRole->givePermissionTo($permission);
            }
        }
    }
}
