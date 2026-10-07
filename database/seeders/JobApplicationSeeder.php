<?php

namespace Database\Seeders;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\Seeder;

class JobApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->firstOrCreate(
            ['email' => 'job-tracker-demo@example.test'],
            [
                'name' => 'Job Tracker Demo',
                'password' => fake()->password(24),
                'email_verified_at' => now(),
            ],
        );

        if ($user->jobApplications()->exists()) {
            return;
        }

        JobApplication::factory()
            ->count(100)
            ->for($user)
            ->create();
    }
}
