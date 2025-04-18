<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

it('has admin role', function () {
    //Arrange
    $role = Role::where('name', 'admin')->first()
        ?? Role::create(['name' => 'admin', 'guard_name' => 'web']);
    $permissions = [
        'view_any_day',
    ];
    foreach ($permissions as $permission) {
        Permission::create(['name' => $permission, 'guard_name' => 'web']);
    }
    $role->syncPermissions(Permission::all());
    $user = User::factory()->create();
    $user->assignRole($role);

    //Act
    $response = $this->actingAs($user)
        ->get('/admin/days');


    //Assert
    $response->assertStatus(200);

});
