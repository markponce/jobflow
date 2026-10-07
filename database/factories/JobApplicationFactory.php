<?php

namespace Database\Factories;

use App\Enums\JobApplicationExperienceLevel;
use App\Enums\JobApplicationSalaryPeriod;
use App\Enums\JobApplicationStatus;
use App\Enums\JobApplicationWorkSetup;
use App\Models\JobApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobApplication>
 */
class JobApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_name' => fake()->company(),
            'company_address' => fake()->address(),
            'title' => fake()->jobTitle(),
            'url' => fake()->url(),
            'content' => fake()->paragraphs(3, true),
            'status' => fake()->randomElement(JobApplicationStatus::cases())->value,
            'work_setup' => fake()->randomElement(JobApplicationWorkSetup::cases())->value,
            'experience_level' => fake()->randomElement(JobApplicationExperienceLevel::cases())->value,
            'salary_min' => $salaryMin = fake()->numberBetween(30000, 90000),
            'salary_max' => fake()->numberBetween($salaryMin, 250000),
            'salary_period' => fake()->randomElement(JobApplicationSalaryPeriod::cases())->value,
            'salary_currency' => fake()->randomElement(['USD', 'PHP', 'EUR']),
            'notes' => fake()->sentences(2, true),
            'applied_at' => fake()->optional()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
