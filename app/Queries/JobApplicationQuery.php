<?php

namespace App\Queries;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class JobApplicationQuery
{
    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<JobApplication>
     */
    public function build(User $user, array $filters): Builder
    {
        $query = JobApplication::query()->whereBelongsTo($user);

        foreach (['status', 'work_setup', 'experience_level', 'salary_period', 'salary_currency'] as $filter) {
            $value = $filters[$filter] ?? null;

            if (is_string($value) && $value !== '') {
                $query->where($filter, $value);
            }
        }

        $search = $filters['search'] ?? null;
        $minimum = $filters['salary_min'] ?? null;
        $maximum = $filters['salary_max'] ?? null;

        $this->applySearch($query, $user, is_string($search) ? $search : null);
        $this->applySalaryRange(
            $query,
            is_numeric($minimum) ? $minimum : null,
            is_numeric($maximum) ? $maximum : null,
        );

        return $query
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }

    /**
     * @param  Builder<JobApplication>  $query
     */
    private function applySearch(Builder $query, User $user, ?string $search): void
    {
        $search = trim((string) $search);

        if ($search === '') {
            return;
        }

        $searchColumns = ['title', 'company_name', 'company_address', 'content', 'notes'];
        $tokens = preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($search), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $tokens = array_values(array_filter(
            $tokens,
            static fn (string $token): bool => mb_strlen($token) >= 3
                && ! in_array($token, self::mysqlStopWords(), true),
        ));
        $supportsFullText = in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true);
        $booleanSearch = implode(' ', array_map(
            static fn (string $token): string => $token.'*',
            $tokens,
        ));

        if ($supportsFullText && $booleanSearch !== '') {
            $textMatches = JobApplication::query()
                ->whereBelongsTo($user)
                ->whereFullText($searchColumns, $booleanSearch, ['mode' => 'boolean'])
                ->select('id');
            $urlMatches = JobApplication::query()
                ->whereBelongsTo($user)
                ->where('url', 'like', '%'.$search.'%')
                ->select('id');

            $query->whereIn('id', $textMatches->union($urlMatches));

            return;
        }

        $query->where(function (Builder $searchQuery) use ($searchColumns, $search): void {
            foreach ($searchColumns as $column) {
                $searchQuery->orWhere($column, 'like', '%'.$search.'%');
            }

            $searchQuery->orWhere('url', 'like', '%'.$search.'%');
        });
    }

    /**
     * A missing endpoint is treated as unbounded. Rows with no salary endpoints are excluded.
     *
     * @param  numeric-string|int|float|null  $minimum
     * @param  numeric-string|int|float|null  $maximum
     * @param  Builder<JobApplication>  $query
     */
    private function applySalaryRange(Builder $query, string|int|float|null $minimum, string|int|float|null $maximum): void
    {
        if ($minimum === null && $maximum === null) {
            return;
        }

        $query->where(function (Builder $salaryQuery) use ($minimum, $maximum): void {
            $salaryQuery->where(function (Builder $knownSalaryQuery): void {
                $knownSalaryQuery
                    ->whereNotNull('salary_min')
                    ->orWhereNotNull('salary_max');
            });

            if ($minimum !== null) {
                $salaryQuery->where(function (Builder $overlapQuery) use ($minimum): void {
                    $overlapQuery
                        ->whereNull('salary_max')
                        ->orWhere('salary_max', '>=', $minimum);
                });
            }

            if ($maximum !== null) {
                $salaryQuery->where(function (Builder $overlapQuery) use ($maximum): void {
                    $overlapQuery
                        ->whereNull('salary_min')
                        ->orWhere('salary_min', '<=', $maximum);
                });
            }
        });
    }

    /**
     * @return list<string>
     */
    private static function mysqlStopWords(): array
    {
        return [
            'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'com',
            'de', 'en', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'la',
            'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was', 'what',
            'when', 'where', 'who', 'will', 'with',
        ];
    }
}
