<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admins = [
            [
                'name' => 'Luke Addy',
                'email' => 'lukeaddyflooringcapital@gmail.com',
                'password' => '123456AaMD',
            ],
            [
                'name' => 'Daniel Moses',
                'email' => 'danielmoses849@gmail.com',
                'password' => 'admin1234',
            ],
        ];

        foreach ($admins as $admin) {
            Admin::updateOrCreate(
                ['email' => $admin['email']],
                [
                    'name' => $admin['name'],
                    'password' => Hash::make($admin['password']),
                ]
            );
        }

        \App\Models\Setting::updateOrCreate(
            ['key' => 'email'],
            ['value' => 'orders@example.com']
        );

        \App\Models\Setting::updateOrCreate(
            ['key' => 'phone'],
            ['value' => '(352) 450-3211']
        );
    }
}
