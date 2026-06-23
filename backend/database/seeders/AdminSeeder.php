<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the admins table with the two initial admin accounts.
     */
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'lukeaddyflooringcapital@gmail.com'],
            [
                'name'     => 'Luke Addy',
                'password' => Hash::make('123456AaMD'),
            ]
        );

        Admin::updateOrCreate(
            ['email' => 'danielmoses849@gmail.com'],
            [
                'name'     => 'Daniel Moses',
                'password' => Hash::make('admin1234'),
            ]
        );
    }
}
