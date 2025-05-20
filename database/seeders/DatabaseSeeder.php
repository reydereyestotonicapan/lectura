<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Day;
use App\Models\Question;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Role::where('name', 'default_user')->first()
            ?? Role::factory()->create([
                'name' => 'default_user',
            ]);

        // Create a super admin user
        $user = User::where('email', 'mmenchu@reydereyestotonicapan.org')->first()
            ?? User::factory()->create([
            'name' => 'Miguel',
            'email' => 'mmenchu@reydereyestotonicapan.org',
        ]);
        $role = Role::where('name', 'super_admin')->first()
            ?? Role::factory()->create();
        $user->assignRole($role);
        //TODO create permissions and call to permission seeder
        $superAdminPermissions = [
            'view_any_day',
            'create_day',
            'update_day',
            'delete_day',
            'view_any_role',
            'create_role',
            'update_role',
            'delete_role',
            'view_any_user',
            'create_user',
            'update_user',
            'delete_user',
        ];
        foreach($superAdminPermissions as $permission)
        {
            Permission::findOrCreate($permission);
        }
        $permissionModels = Permission::whereIn('name', $superAdminPermissions)->get();
        $role->givePermissionTo($permissionModels);

        // Create first question with its answers
        $day = Day::factory()->create();

        $question1 = Question::factory()
            ->for($day)
            ->state([
                "question" => "¿Quién fué el hijo primogenito de Isaac?"
            ])
            ->create();

        Answer::factory()
            ->for($question1)
            ->createMany([
                ["description" => "Esaú", "is_correct" => true],
                ["description" => "Jacob", "is_correct" => false],
                ["description" => "Abraham", "is_correct" => false]
            ]);

        // Create second question without answers
        $question2 = Question::factory()
            ->for($day)
            ->state([
                "question" => "¿Qué le pareció la lectura del día de hoy?"
            ])
            ->create();

        //call to Admin seeder
        $this->call([
            ShieldSeeder::class
        ]);
    }
}
