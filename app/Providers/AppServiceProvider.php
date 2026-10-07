<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        DB::listen(static function (QueryExecuted $query): void {
            if (! request()->routeIs('job-applications.index')) {
                return;
            }

            $filterNames = array_values(array_intersect(
                [
                    'search',
                    'status',
                    'work_setup',
                    'experience_level',
                    'salary_period',
                    'salary_currency',
                    'salary_min',
                    'salary_max',
                    'per_page',
                ],
                array_keys(request()->query()),
            ));

            if ($filterNames === []) {
                return;
            }

            Log::debug('Job application filter query executed', [
                'connection' => $query->connectionName,
                'duration_ms' => $query->time,
                'filter_names' => $filterNames,
                'sql' => app()->environment(['local', 'testing'])
                    ? $query->toRawSql()
                    : $query->sql,
            ]);
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
