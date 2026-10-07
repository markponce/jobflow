<?php

namespace App\Http\Requests;

use App\Enums\JobApplicationExperienceLevel;
use App\Enums\JobApplicationSalaryPeriod;
use App\Enums\JobApplicationStatus;
use App\Enums\JobApplicationWorkSetup;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class IndexJobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', JobApplication::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $search = $this->input('search');

        if (is_string($search)) {
            $this->merge(['search' => trim($search)]);
        }

        $currency = $this->input('salary_currency');

        if (is_string($currency)) {
            $this->merge(['salary_currency' => strtoupper($currency)]);
        }
    }

    /**
     * @return array<string, array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:200'],
            'status' => ['nullable', Rule::enum(JobApplicationStatus::class)],
            'work_setup' => ['nullable', Rule::enum(JobApplicationWorkSetup::class)],
            'experience_level' => ['nullable', Rule::enum(JobApplicationExperienceLevel::class)],
            'salary_period' => ['nullable', Rule::enum(JobApplicationSalaryPeriod::class)],
            'salary_currency' => ['nullable', 'string', 'size:3', 'alpha:ascii'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'per_page' => ['sometimes', 'integer', Rule::in(range(10, 100, 10))],
        ];
    }

    /**
     * @return list<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $user = $this->user();

                if (
                    $user instanceof User
                    &&
                    ($this->filled('salary_min') || $this->filled('salary_max'))
                    && ! $this->filled('salary_currency')
                    && $user->jobApplications()
                        ->whereNotNull('salary_currency')
                        ->distinct()
                        ->count('salary_currency') > 1
                ) {
                    $validator->errors()->add(
                        'salary_currency',
                        'Choose a currency before filtering by salary.',
                    );
                }

                if ($validator->errors()->hasAny(['salary_min', 'salary_max'])) {
                    return;
                }

                $salaryMin = $this->input('salary_min');
                $salaryMax = $this->input('salary_max');

                if (
                    is_numeric($salaryMin)
                    && is_numeric($salaryMax)
                    && (float) $salaryMin > (float) $salaryMax
                ) {
                    $validator->errors()->add('salary_max', 'The upper salary filter must be at least the lower bound.');
                }
            },
        ];
    }
}
