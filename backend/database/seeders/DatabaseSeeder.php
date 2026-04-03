<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@teamvoice.ai'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // 2. Create Employees
        $staff1 = User::firstOrCreate(
            ['email' => 'kynblue@gmail.com'],
            [
                'name' => 'Kayn Blue',
                'password' => Hash::make('password123'),
            ]
        );

        $staff2 = User::firstOrCreate(
            ['email' => 'tuong@example.com'],
            [
                'name' => 'Trần Thế Tường',
                'password' => Hash::make('password123'),
            ]
        );

        $staff3 = User::firstOrCreate(
            ['email' => 'an@example.com'],
            [
                'name' => 'Nguyễn Văn An',
                'password' => Hash::make('password123'),
            ]
        );

        // 3. Create Sample Projects
        $proj1 = Project::firstOrCreate(
            ['name' => 'Phát triển App TeamVoice'],
            [
                'description' => 'Dự án cốt lõi tích hợp AI ghi âm và phân tích báo cáo tuần.',
                'color' => '#F34455',
            ]
        );

        $proj2 = Project::firstOrCreate(
            ['name' => 'Chiến dịch Marketing Q2'],
            [
                'description' => 'Phủ sóng thương hiệu và tăng trưởng người dùng mới.',
                'color' => '#FD94B4',
            ]
        );

        // 4. Assign Members
        // Admin is in all projects
        $proj1->members()->syncWithoutDetaching([$admin->id => ['role' => 'admin']]);
        $proj2->members()->syncWithoutDetaching([$admin->id => ['role' => 'admin']]);

        // Assign others
        $proj1->members()->syncWithoutDetaching([$staff1->id => ['role' => 'member']]);
        $proj1->members()->syncWithoutDetaching([$staff2->id => ['role' => 'member']]);

        $proj2->members()->syncWithoutDetaching([$staff1->id => ['role' => 'member']]);
        $proj2->members()->syncWithoutDetaching([$staff3->id => ['role' => 'member']]);
    }
}
