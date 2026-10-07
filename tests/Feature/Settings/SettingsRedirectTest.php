<?php

use App\Models\User;

test('authenticated users are redirected from settings to their profile settings', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings');

    $response->assertRedirect(route('profile.edit'));
});

test('settings redirect does not accept QUERY requests', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->call('QUERY', '/settings');

    $response->assertMethodNotAllowed();
});
