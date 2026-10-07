<?php

namespace App\Http\Requests;

use App\Enums\JobApplicationExperienceLevel;
use App\Enums\JobApplicationSalaryPeriod;
use App\Enums\JobApplicationStatus;
use App\Enums\JobApplicationWorkSetup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateJobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('job_application')) ?? false;
    }

    protected function prepareForValidation(): void
    {
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
            'company_name' => ['required', 'string', 'max:255'],
            'company_address' => ['nullable', 'string'],
            'title' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url'],
            'content' => ['nullable', 'string'],
            'status' => ['required', Rule::enum(JobApplicationStatus::class)],
            'work_setup' => ['required', Rule::enum(JobApplicationWorkSetup::class)],
            'experience_level' => ['nullable', Rule::enum(JobApplicationExperienceLevel::class)],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'salary_period' => ['nullable', Rule::enum(JobApplicationSalaryPeriod::class)],
            'salary_currency' => ['nullable', 'string', 'size:3', 'alpha:ascii'],
            'notes' => ['nullable', 'string'],
            'applied_at' => ['nullable', 'date'],
        ];
    }

    /**
     * @return list<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
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
                    $validator->errors()->add('salary_max', 'The maximum salary must be at least the minimum salary.');
                }
            },
        ];
    }
}
