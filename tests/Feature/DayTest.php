<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

it('has admin role', function () {

    $user = User::factory()->create([
        'name' => 'Miguel',
        'email' => 'mmenchu@reydereyestotonicapan.org',
    ]);
    $role = Role::where('name', 'super_admin')->first()
        ?? Role::factory()->create();
    $user->assignRole($role);

    //Arrange
    // Give admin all permissions
    $permissions = [
        'view_any_day',
        'day_view_any',  // Alternative format Shield might use
        'access_admin_panel', // Often required for any admin panel access
        'view_admin_panel'    // Another common requirement
    ];

    foreach ($permissions as $perm) {
        $permission = Permission::firstOrCreate(['name' => $perm], ['guard_name' => 'web']);
        $role->givePermissionTo($permission);
    }


    dump("User has role: " . $user->hasRole('super_admin'));
    dump("User can view_any_day: " . $user->can('view_any_day'));

    //Act
    $response = $this->actingAs($user)
        ->get('/admin/days');

    //Assert
    $response->assertStatus(200);
    // TODO create your firs test to start TDD
});
