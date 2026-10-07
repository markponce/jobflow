<?php

namespace App\Http\Controllers;

use App\Enums\JobApplicationExperienceLevel;
use App\Enums\JobApplicationSalaryPeriod;
use App\Enums\JobApplicationStatus;
use App\Enums\JobApplicationWorkSetup;
use App\Http\Requests\IndexJobApplicationRequest;
use App\Http\Requests\StoreJobApplicationRequest;
use App\Http\Requests\UpdateJobApplicationRequest;
use App\Models\JobApplication;
use App\Queries\JobApplicationQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class JobApplicationController extends Controller
{
    public function index(IndexJobApplicationRequest $request, JobApplicationQuery $jobApplicationQuery): Response
    {
        $user = $request->user();
        $filters = array_filter(
            $request->validated(),
            static fn (mixed $value): bool => $value !== null && $value !== '',
        );
        $applications = $jobApplicationQuery->build($user, $filters)
            ->select([
                'id',
                'company_name',
                'title',
                'url',
                'status',
                'work_setup',
                'experience_level',
                'salary_min',
                'salary_max',
                'salary_period',
                'salary_currency',
                'applied_at',
                'created_at',
            ])
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        $currencies = $user->jobApplications()
            ->whereNotNull('salary_currency')
            ->distinct()
            ->orderBy('salary_currency')
            ->pluck('salary_currency')
            ->values();
        $salaryCurrency = $filters['salary_currency']
            ?? ($currencies->count() === 1 ? $currencies->first() : null);
        $salaryStatistics = $currencies->count() > 1 && $salaryCurrency === null
            ? null
            : $user->jobApplications()
                ->when($salaryCurrency !== null, fn ($query) => $query->where('salary_currency', $salaryCurrency))
                ->where(function ($query): void {
                    $query->whereNotNull('salary_min')->orWhereNotNull('salary_max');
                })
                ->selectRaw(
                    'MIN(COALESCE(salary_min, salary_max)) AS minimum_salary, MAX(COALESCE(salary_max, salary_min)) AS maximum_salary',
                )
                ->first();
        $minimumSalary = $salaryStatistics?->getAttribute('minimum_salary');
        $maximumSalary = $salaryStatistics?->getAttribute('maximum_salary');

        return Inertia::render('job-applications/index', [
            'applications' => $applications,
            'filters' => $filters,
            'hasApplications' => $user->jobApplications()->exists(),
            'salaryBounds' => [
                'minimum' => is_numeric($minimumSalary) ? (float) $minimumSalary : null,
                'maximum' => is_numeric($maximumSalary) ? (float) $maximumSalary : null,
            ],
            'filterOptions' => [
                'statuses' => JobApplicationStatus::options(),
                'workSetups' => JobApplicationWorkSetup::options(),
                'experienceLevels' => JobApplicationExperienceLevel::options(),
                'salaryPeriods' => JobApplicationSalaryPeriod::options(),
                'currencies' => $currencies,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', JobApplication::class);

        return Inertia::render('job-applications/create', [
            'options' => $this->formOptions(),
        ]);
    }

    public function store(StoreJobApplicationRequest $request): RedirectResponse
    {
        $application = $request->user()->jobApplications()->create($request->validated());

        return to_route('job-applications.show', $application)
            ->with('success', 'Job application created.');
    }

    public function show(JobApplication $jobApplication): Response
    {
        Gate::authorize('view', $jobApplication);

        return Inertia::render('job-applications/show', [
            'application' => $jobApplication,
        ]);
    }

    public function edit(JobApplication $jobApplication): Response
    {
        Gate::authorize('update', $jobApplication);

        return Inertia::render('job-applications/edit', [
            'application' => $jobApplication,
            'options' => $this->formOptions(),
        ]);
    }

    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): RedirectResponse
    {
        $jobApplication->update($request->validated());

        return to_route('job-applications.show', $jobApplication)
            ->with('success', 'Job application updated.');
    }

    public function destroy(JobApplication $jobApplication): RedirectResponse
    {
        Gate::authorize('delete', $jobApplication);
        $jobApplication->delete();

        return to_route('job-applications.index')
            ->with('success', 'Job application deleted.');
    }

    /**
     * @return array<string, list<array{value: string, label: string}>>
     */
    private function formOptions(): array
    {
        return [
            'statuses' => JobApplicationStatus::options(),
            'workSetups' => JobApplicationWorkSetup::options(),
            'experienceLevels' => JobApplicationExperienceLevel::options(),
            'salaryPeriods' => JobApplicationSalaryPeriod::options(),
        ];
    }
}
