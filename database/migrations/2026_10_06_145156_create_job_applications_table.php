<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->text('company_address')->nullable();
            $table->string('title');
            $table->text('url');
            $table->text('content')->nullable();
            $table->string('status', 50)->default('SAVED');
            $table->string('work_setup', 20)->default('ONSITE');
            $table->string('experience_level', 20)->nullable();
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->string('salary_period', 20)->nullable();
            $table->char('salary_currency', 3)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->timestamps();

            $table->index(
                ['user_id', 'created_at', 'id'],
                'job_applications_user_created_id_idx',
            );

            if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
                $table->fullText(
                    ['title', 'company_name', 'company_address', 'content', 'notes'],
                    'job_applications_search_fulltext',
                );
            }
        });

        if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            DB::statement(<<<'SQL'
                ALTER TABLE job_applications
                    ADD CONSTRAINT job_applications_status_check
                        CHECK (status IN (
                            'SAVED', 'APPLIED', 'UNDER_REVIEW', 'INTERVIEW',
                            'TECHNICAL_EXAM', 'TECHNICAL_INTERVIEW',
                            'FINAL_INTERVIEW', 'OFFER', 'ACCEPTED',
                            'REJECTED', 'WITHDRAWN'
                        )),
                    ADD CONSTRAINT job_applications_work_setup_check
                        CHECK (work_setup IN ('ONSITE', 'HYBRID', 'WORK_FROM_HOME')),
                    ADD CONSTRAINT job_applications_experience_level_check
                        CHECK (
                            experience_level IS NULL OR experience_level IN (
                                'ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD',
                                'MANAGER', 'DIRECTOR', 'EXECUTIVE'
                            )
                        ),
                    ADD CONSTRAINT job_applications_salary_period_check
                        CHECK (salary_period IS NULL OR salary_period IN ('MONTHLY', 'YEARLY')),
                    ADD CONSTRAINT job_applications_salary_range_check
                        CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max),
                    ADD CONSTRAINT job_applications_salary_positive_check
                        CHECK (
                            (salary_min IS NULL OR salary_min >= 0)
                            AND (salary_max IS NULL OR salary_max >= 0)
                        )
            SQL);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
