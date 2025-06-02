<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

it('has users page', function () {
    $role = Role::where('name', 'super_admin')->first()
        ?? Role::create(['name' => 'super_admin', 'guard_name' => 'web']);
    $permissions = [
        'view_any_user',
    ];
    foreach ($permissions as $permission) {
        Permission::create(['name' => $permission, 'guard_name' => 'web']);
    }
    $role->syncPermissions(Permission::all());
    $user = User::factory()->create();
    $user->assignRole($role);
    $response = $this->actingAs($user)
        ->get('/admin/users');
    $response->assertStatus(200);
});


test('basic test', function () {
    expect(true)->toBeTrue();
});
