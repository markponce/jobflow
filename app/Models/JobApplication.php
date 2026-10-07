<?php

namespace App\Models;

use App\Enums\JobApplicationExperienceLevel;
use App\Enums\JobApplicationSalaryPeriod;
use App\Enums\JobApplicationStatus;
use App\Enums\JobApplicationWorkSetup;
use Database\Factories\JobApplicationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property int $user_id
 * @property string $company_name
 * @property string|null $company_address
 * @property string $title
 * @property string $url
 * @property string|null $content
 * @property JobApplicationStatus $status
 * @property JobApplicationWorkSetup $work_setup
 * @property JobApplicationExperienceLevel|null $experience_level
 * @property numeric-string|null $salary_min
 * @property numeric-string|null $salary_max
 * @property JobApplicationSalaryPeriod|null $salary_period
 * @property string|null $salary_currency
 * @property string|null $notes
 * @property Carbon|null $applied_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'company_name',
    'company_address',
    'title',
    'url',
    'content',
    'status',
    'work_setup',
    'experience_level',
    'salary_min',
    'salary_max',
    'salary_period',
    'salary_currency',
    'notes',
    'applied_at',
])]
class JobApplication extends Model
{
    /** @use HasFactory<JobApplicationFactory> */
    use HasFactory, HasUuids;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => JobApplicationStatus::class,
            'work_setup' => JobApplicationWorkSetup::class,
            'experience_level' => JobApplicationExperienceLevel::class,
            'salary_min' => 'decimal:2',
            'salary_max' => 'decimal:2',
            'salary_period' => JobApplicationSalaryPeriod::class,
            'applied_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
