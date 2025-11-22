<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $researcherRole = Role::where('name', 'researcher')->first();

        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'role_id' => $adminRole->id,
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create researcher user
        User::firstOrCreate(
            ['email' => 'researcher@example.com'],
            [
                'first_name' => 'Researcher',
                'last_name' => 'User',
                'role_id' => $researcherRole->id,
                'email' => 'researcher@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
    }
}
