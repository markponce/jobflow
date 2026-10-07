<?php

use App\Models\JobApplication;
use App\Models\User;
use App\Queries\JobApplicationQuery;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login before accessing applications', function () {
    $this->get('/job-applications')
        ->assertRedirect(route('login'));
});

test('users only see their own applications in the paginated listing', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $application = JobApplication::factory()->for($user)->create([
        'content' => 'This long job description is not needed on the listing.',
        'notes' => 'Private notes are also omitted from list rows.',
    ]);
    JobApplication::factory()->for($otherUser)->create();

    $this->actingAs($user)
        ->get(route('job-applications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('job-applications/index')
            ->has('applications.data', 1)
            ->where('applications.data.0.id', $application->id)
            ->missing('applications.data.0.content')
            ->missing('applications.data.0.notes')
            ->where('hasApplications', true));
});

test('users can create update view and delete their own application', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('job-applications.store'), jobApplicationPayload([
        'user_id' => $otherUser->id,
        'salary_currency' => 'php',
    ]))
        ->assertRedirect();

    $application = JobApplication::query()->sole();

    expect($application->user_id)->toBe($user->id)
        ->and($application->salary_currency)->toBe('PHP');

    $this->get(route('job-applications.show', $application))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('job-applications/show')
            ->where('application.id', $application->id));

    $this->get(route('job-applications.edit', $application))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('job-applications/edit')
            ->where('application.id', $application->id));

    $this->put(route('job-applications.update', $application), jobApplicationPayload([
        'title' => 'Updated Software Engineer',
    ]))
        ->assertRedirect(route('job-applications.show', $application));

    expect($application->refresh()->title)->toBe('Updated Software Engineer');

    $this->delete(route('job-applications.destroy', $application))
        ->assertRedirect(route('job-applications.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('job_applications', ['id' => $application->id]);
});

test('users cannot view update or delete another users application', function () {
    $owner = User::factory()->create();
    $visitor = User::factory()->create();
    $application = JobApplication::factory()->for($owner)->create();

    $this->actingAs($visitor)
        ->get(route('job-applications.show', $application))
        ->assertForbidden();

    $this->get(route('job-applications.edit', $application))
        ->assertForbidden();

    $this->put(route('job-applications.update', $application), jobApplicationPayload())
        ->assertForbidden();

    $this->delete(route('job-applications.destroy', $application))
        ->assertForbidden();

    $this->assertDatabaseHas('job_applications', ['id' => $application->id]);
});

test('search matches each requested text field', function (string $field) {
    $user = User::factory()->create();
    $application = JobApplication::factory()->for($user)->create([
        $field => $field === 'url'
            ? 'https://xy.test/jobs/engineer'
            : 'xy search marker',
    ]);

    $this->actingAs($user)
        ->get(route('job-applications.index', ['search' => 'xy']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('applications.data', 1)
            ->where('applications.data.0.id', $application->id));
})->with([
    'title',
    'company_name',
    'url',
    'company_address',
    'content',
    'notes',
]);

test('blank search and filters are omitted from the listing query', function () {
    $user = User::factory()->create();
    JobApplication::factory()->for($user)->create(['status' => 'SAVED']);
    JobApplication::factory()->for($user)->create(['status' => 'OFFER']);

    $this->actingAs($user)
        ->get(route('job-applications.index', [
            'search' => '   ',
            'status' => '',
            'salary_currency' => '',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('applications.data', 2)
            ->where('applications.total', 2)
            ->where('filters', []));
});

test('indexable search terms use MySQL full-text and keep URL matching separate', function () {
    $user = User::factory()->make()->forceFill(['id' => 1]);
    $sql = app(JobApplicationQuery::class)
        ->build($user, ['search' => 'software engineer'])
        ->toSql();

    expect($sql)
        ->toContain('match (`title`, `company_name`, `company_address`, `content`, `notes`)')
        ->toContain('`url` like ?');
});

test('committed application text is found through the MySQL full-text index', function () {
    $user = User::factory()->create();
    $textMatch = JobApplication::factory()->for($user)->create([
        'title' => 'ArchitecturalEngineer',
    ]);
    $urlMatch = JobApplication::factory()->for($user)->create([
        'title' => 'Another role',
        'url' => 'https://example.test/jobs/architecturalengineer',
    ]);

    DB::commit();

    try {
        $this->actingAs($user)
            ->get(route('job-applications.index', ['search' => 'architecturaleng']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('applications.data', 2)
                ->where('applications.data', fn ($applications) => collect($applications)
                    ->pluck('id')
                    ->sort()
                    ->values()
                    ->all() === collect([$textMatch->id, $urlMatch->id])
                    ->sort()
                    ->values()
                    ->all()));
    } finally {
        DB::table('job_applications')->whereIn('id', [$textMatch->id, $urlMatch->id])->delete();
        DB::table('users')->where('id', $user->id)->delete();
    }
});

test('the MySQL query plan exposes full-text and user-scoped listing indexes', function () {
    $user = User::factory()->make()->forceFill(['id' => 1]);
    $query = app(JobApplicationQuery::class)->build($user, ['search' => 'software engineer']);
    $plans = DB::select('EXPLAIN '.$query->toSql(), $query->getBindings());
    $possibleKeys = collect($plans)->pluck('possible_keys')->filter()->implode(',');

    expect($possibleKeys)->toContain('job_applications_search_fulltext');

    $listingQuery = JobApplication::query()
        ->whereBelongsTo($user)
        ->orderByDesc('created_at')
        ->orderByDesc('id');
    $listingPlan = DB::selectOne('EXPLAIN '.$listingQuery->toSql(), $listingQuery->getBindings());

    expect($listingPlan->possible_keys)->toContain('job_applications_user_created_id_idx');
});

test('filters can be combined and currency choices are scoped to the user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $matching = JobApplication::factory()->for($user)->create([
        'status' => 'INTERVIEW',
        'work_setup' => 'HYBRID',
        'experience_level' => 'SENIOR',
        'salary_period' => 'MONTHLY',
        'salary_currency' => 'PHP',
    ]);
    JobApplication::factory()->for($user)->create([
        'status' => 'SAVED',
        'salary_currency' => 'USD',
    ]);
    JobApplication::factory()->for($otherUser)->create([
        'salary_currency' => 'EUR',
    ]);

    $this->actingAs($user)
        ->get(route('job-applications.index', [
            'status' => 'INTERVIEW',
            'work_setup' => 'HYBRID',
            'experience_level' => 'SENIOR',
            'salary_period' => 'MONTHLY',
            'salary_currency' => 'php',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('applications.data', 1)
            ->where('applications.data.0.id', $matching->id)
            ->where('filterOptions.currencies', ['PHP', 'USD']));
});

test('filtered application requests log SQL with interpolated bindings', function () {
    $user = User::factory()->create();
    JobApplication::factory()->for($user)->create(['status' => 'INTERVIEW']);

    Log::spy();

    $this->actingAs($user)
        ->get(route('job-applications.index', [
            'search' => 'private search term',
            'status' => 'INTERVIEW',
        ]))
        ->assertOk();

    Log::shouldHaveReceived('debug')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Job application filter query executed'
            && str_contains($context['sql'] ?? '', 'job_applications')
            && str_contains($context['sql'] ?? '', 'private search term')
            && str_contains($context['sql'] ?? '', 'INTERVIEW')
            && ($context['filter_names'] ?? []) === ['search', 'status']
            && ! array_key_exists('bindings', $context)
            && isset($context['duration_ms'], $context['connection']))
        ->atLeast()
        ->once();
});

test('salary filters match overlapping ranges and treat one missing endpoint as open-ended', function () {
    $user = User::factory()->create();
    $exact = JobApplication::factory()->for($user)->create([
        'salary_min' => 50000,
        'salary_max' => 100000,
        'salary_currency' => 'PHP',
    ]);
    $missingMinimum = JobApplication::factory()->for($user)->create([
        'salary_min' => null,
        'salary_max' => 70000,
        'salary_currency' => 'PHP',
    ]);
    $missingMaximum = JobApplication::factory()->for($user)->create([
        'salary_min' => 90000,
        'salary_max' => null,
        'salary_currency' => 'PHP',
    ]);
    JobApplication::factory()->for($user)->create([
        'salary_min' => 100001,
        'salary_max' => 200000,
        'salary_currency' => 'PHP',
    ]);
    JobApplication::factory()->for($user)->create([
        'salary_min' => null,
        'salary_max' => null,
        'salary_currency' => 'PHP',
    ]);

    $this->actingAs($user)
        ->get(route('job-applications.index', [
            'salary_min' => 50000,
            'salary_max' => 100000,
            'salary_currency' => 'PHP',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('applications.data', 3)
            ->where('applications.data', fn ($applications) => collect($applications)
                ->pluck('id')
                ->sort()
                ->values()
                ->all() === collect([$exact->id, $missingMinimum->id, $missingMaximum->id])
                ->sort()
                ->values()
                ->all()));
});

test('salary bounds use only the authenticated users records', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    JobApplication::factory()->for($user)->create([
        'salary_min' => 30000,
        'salary_max' => 80000,
        'salary_currency' => 'USD',
    ]);
    JobApplication::factory()->for($user)->create([
        'salary_min' => null,
        'salary_max' => 120000,
        'salary_currency' => 'USD',
    ]);
    JobApplication::factory()->for($otherUser)->create([
        'salary_min' => 1,
        'salary_max' => 999999,
        'salary_currency' => 'USD',
    ]);

    $this->actingAs($user)
        ->get(route('job-applications.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('salaryBounds.minimum', 30000)
            ->where('salaryBounds.maximum', 120000));
});

test('a salary range requires a currency when the user has multiple currencies', function () {
    $user = User::factory()->create();
    JobApplication::factory()->for($user)->create(['salary_currency' => 'PHP']);
    JobApplication::factory()->for($user)->create(['salary_currency' => 'USD']);

    $this->actingAs($user)
        ->get(route('job-applications.index', [
            'salary_min' => 50000,
            'salary_max' => 100000,
        ]))
        ->assertSessionHasErrors(['salary_currency']);
});

test('pagination preserves active filters in its links', function () {
    $user = User::factory()->create();
    JobApplication::factory(21)->for($user)->create(['status' => 'INTERVIEW']);

    $this->actingAs($user)
        ->get(route('job-applications.index', ['status' => 'INTERVIEW', 'page' => 2]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('applications.data', 10)
            ->where('filters.status', 'INTERVIEW')
            ->where('applications.per_page', 10)
            ->where('applications.prev_page_url', fn (string $url): bool => str_contains($url, 'status=INTERVIEW')));
});

test('users can choose page sizes in increments of ten up to one hundred', function () {
    $user = User::factory()->create();
    JobApplication::factory(31)->for($user)->create();

    $this->actingAs($user)
        ->get(route('job-applications.index', ['per_page' => 30]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.per_page', '30')
            ->where('applications.per_page', 30)
            ->has('applications.data', 30)
            ->where('applications.next_page_url', fn (string $url): bool => str_contains($url, 'per_page=30')));
});

test('the default page size is ten', function () {
    $user = User::factory()->create();
    JobApplication::factory(11)->for($user)->create();

    $this->actingAs($user)
        ->get(route('job-applications.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('applications.per_page', 10)
            ->has('applications.data', 10)
            ->where('applications.next_page_url', fn (string $url): bool => str_contains($url, 'page=2')));
});

test('the minimum and maximum page sizes are accepted', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('job-applications.index', ['per_page' => 10]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.per_page', '10')
            ->where('applications.per_page', 10));

    $this->get(route('job-applications.index', ['per_page' => 100]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.per_page', '100')
            ->where('applications.per_page', 100));
});

test('page sizes below ten above one hundred or outside ten-item increments are rejected', function (int $pageSize) {
    $this->actingAs(User::factory()->create())
        ->get(route('job-applications.index', ['per_page' => $pageSize]))
        ->assertSessionHasErrors(['per_page']);
})->with([
    'below minimum' => 9,
    'not a ten-item increment' => 15,
    'above maximum' => 110,
]);

test('create validation requires valid required fields and rejects invalid salary data', function (
    array $overrides,
    array $errors,
) {
    $this->actingAs(User::factory()->create())
        ->post(route('job-applications.store'), jobApplicationPayload($overrides))
        ->assertSessionHasErrors($errors);
})->with([
    'required values' => [
        ['company_name' => '', 'title' => '', 'url' => '', 'status' => '', 'work_setup' => ''],
        ['company_name', 'title', 'url', 'status', 'work_setup'],
    ],
    'invalid URL' => [['url' => 'not a URL'], ['url']],
    'invalid enum values' => [['status' => 'saved'], ['status']],
    'negative salary' => [['salary_min' => -1], ['salary_min']],
    'minimum above maximum' => [['salary_min' => 100000, 'salary_max' => 50000], ['salary_max']],
    'invalid currency length' => [['salary_currency' => 'PESO'], ['salary_currency']],
]);

/**
 * @return array<string, mixed>
 */
function jobApplicationPayload(array $overrides = []): array
{
    return array_merge([
        'company_name' => 'Example Company',
        'company_address' => '1 Example Street',
        'title' => 'Software Engineer',
        'url' => 'https://example.com/jobs/engineer',
        'content' => 'A job description.',
        'status' => 'SAVED',
        'work_setup' => 'ONSITE',
        'experience_level' => 'MID',
        'salary_min' => 50000,
        'salary_max' => 90000,
        'salary_period' => 'YEARLY',
        'salary_currency' => 'USD',
        'notes' => 'Follow up next week.',
        'applied_at' => null,
    ], $overrides);
}
