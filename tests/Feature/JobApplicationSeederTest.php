<?php

use App\Models\User;
use Database\Seeders\JobApplicationSeeder;

test('the development seeder creates 100 demo applications and is idempotent', function () {
    $this->artisan('db:seed', ['--class' => JobApplicationSeeder::class])
        ->assertExitCode(0);

    $user = User::query()->where('email', 'job-tracker-demo@example.test')->sole();

    expect($user->jobApplications()->count())->toBe(100);

    $this->artisan('db:seed', ['--class' => JobApplicationSeeder::class])
        ->assertExitCode(0);

    expect($user->jobApplications()->count())->toBe(100);
});
