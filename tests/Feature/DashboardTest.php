<?php

use App\Enums\JobApplicationStatus;
use App\Models\JobApplication;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard shows application counts by status for the authenticated user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    JobApplication::factory()->for($user)->create(['status' => JobApplicationStatus::Saved]);
    JobApplication::factory()->for($user)->create(['status' => JobApplicationStatus::Saved]);
    JobApplication::factory()->for($user)->create(['status' => JobApplicationStatus::Interview]);
    JobApplication::factory()->for($otherUser)->create(['status' => JobApplicationStatus::Saved]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('statusCounts', count(JobApplicationStatus::cases()))
            ->where('statusCounts.0.value', 'SAVED')
            ->where('statusCounts.0.label', 'Saved')
            ->where('statusCounts.0.count', 2)
            ->where('statusCounts.1.value', 'APPLIED')
            ->where('statusCounts.1.count', 0)
            ->where('statusCounts.3.value', 'INTERVIEW')
            ->where('statusCounts.3.count', 1));
});
