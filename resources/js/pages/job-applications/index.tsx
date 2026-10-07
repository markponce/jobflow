import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { JobApplicationFilters } from '@/components/job-applications/job-application-filters';
import type { DraftFilters } from '@/components/job-applications/job-application-filters';
import { JobApplicationTable } from '@/components/job-applications/job-application-table';
import { Button } from '@/components/ui/button';
import type {
    JobApplication,
    JobApplicationFilterOptions,
    JobApplicationFilters as AppliedFilters,
    Paginated,
    SalaryBounds,
} from '@/types/job-application';
import {
    create as createApplication,
    index as applicationsIndex,
} from '@/routes/job-applications';

type Props = {
    applications: Paginated<JobApplication>;
    filters: AppliedFilters;
    filterOptions: JobApplicationFilterOptions;
    salaryBounds: SalaryBounds;
    hasApplications: boolean;
};

function makeDraftFilters(
    filters: AppliedFilters,
    bounds: SalaryBounds,
): DraftFilters {
    return {
        status: filters.status ?? '',
        work_setup: filters.work_setup ?? '',
        experience_level: filters.experience_level ?? '',
        salary_period: filters.salary_period ?? '',
        salary_currency: filters.salary_currency ?? '',
        salary_min:
            filters.salary_min === undefined
                ? (bounds.minimum ?? 0)
                : Number(filters.salary_min),
        salary_max:
            filters.salary_max === undefined
                ? (bounds.maximum ?? 0)
                : Number(filters.salary_max),
        per_page: String(filters.per_page ?? 10),
    };
}

function cleanParams(
    params: Record<string, string | number | undefined>,
): Record<string, string | number> {
    const cleaned: Record<string, string | number> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            cleaned[key] = value;
        }
    });

    return cleaned;
}

export default function JobApplicationsIndex({
    applications,
    filters,
    filterOptions,
    salaryBounds,
    hasApplications,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [draftFilters, setDraftFilters] = useState(() =>
        makeDraftFilters(filters, salaryBounds),
    );
    const [salaryRangeEnabled, setSalaryRangeEnabled] = useState(
        filters.salary_min !== undefined || filters.salary_max !== undefined,
    );
    const [loading, setLoading] = useState(false);
    const appliedFilters = useRef(filters);

    const visitWithFilters = useCallback(
        (query: Record<string, string | number | undefined>) => {
            setLoading(true);
            router.get(applicationsIndex().url, cleanParams(query), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setLoading(false),
            });
        },
        [],
    );

    useEffect(() => {
        appliedFilters.current = filters;
    }, [filters]);

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        setDraftFilters(makeDraftFilters(filters, salaryBounds));
        setSalaryRangeEnabled(
            filters.salary_min !== undefined ||
                filters.salary_max !== undefined,
        );
    }, [
        filters.status,
        filters.work_setup,
        filters.experience_level,
        filters.salary_period,
        filters.salary_currency,
        filters.salary_min,
        filters.salary_max,
        filters.per_page,
        salaryBounds.minimum,
        salaryBounds.maximum,
    ]);

    useEffect(() => {
        if (search.trim() === (appliedFilters.current.search ?? '')) {
            return;
        }

        const timeout = window.setTimeout(() => {
            const currentFilters = appliedFilters.current;
            visitWithFilters({
                ...currentFilters,
                search: search.trim() || undefined,
            });
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [search, visitWithFilters]);

    const activeFilterCount = Object.entries(filters).filter(
        ([name, value]) =>
            name !== 'per_page' &&
            value !== '' &&
            value !== null &&
            value !== undefined,
    ).length;
    const filterCurrency =
        draftFilters.salary_currency ||
        (filterOptions.currencies.length === 1
            ? filterOptions.currencies[0]
            : '');
    const appliedFilterCurrency =
        filters.salary_currency ||
        (filterOptions.currencies.length === 1
            ? filterOptions.currencies[0]
            : '');
    const salaryBoundsAreCurrent = filterCurrency === appliedFilterCurrency;

    function applyFilters() {
        const query: Record<string, string | number | undefined> = {
            search: search.trim() || undefined,
            status: draftFilters.status,
            work_setup: draftFilters.work_setup,
            experience_level: draftFilters.experience_level,
            salary_period: draftFilters.salary_period,
            salary_currency: draftFilters.salary_currency,
            per_page: draftFilters.per_page,
        };

        if (salaryRangeEnabled) {
            query.salary_currency = filterCurrency;
            query.salary_min = draftFilters.salary_min;
            query.salary_max = draftFilters.salary_max;
        }

        const cleaned = cleanParams(query);
        appliedFilters.current = cleaned;
        visitWithFilters(query);
    }

    function clearFilters() {
        setSearch('');
        setDraftFilters(makeDraftFilters({}, salaryBounds));
        setSalaryRangeEnabled(false);
        appliedFilters.current = {};
        visitWithFilters({});
    }

    return (
        <>
            <Head title="Job applications" />

            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div className="grid gap-1">
                        <p className="text-sm font-medium text-primary">
                            Career workspace
                        </p>
                        <h1 className="text-h1">Job applications</h1>
                        <p className="text-sm text-muted-foreground">
                            Keep every opportunity and follow-up in one place.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={createApplication()}>
                            <Plus />
                            Add application
                        </Link>
                    </Button>
                </header>

                <JobApplicationFilters
                    search={search}
                    filters={draftFilters}
                    options={filterOptions}
                    bounds={salaryBounds}
                    salaryBoundsAreCurrent={salaryBoundsAreCurrent}
                    salaryRangeEnabled={salaryRangeEnabled}
                    loading={loading}
                    activeFilterCount={activeFilterCount}
                    onSearchChange={setSearch}
                    onFilterChange={(name, value) => {
                        setDraftFilters((current) => ({
                            ...current,
                            [name]: value,
                        }));

                        if (name === 'salary_currency') {
                            setSalaryRangeEnabled(false);
                        }
                    }}
                    onSalaryRangeChange={(minimum, maximum) =>
                        setDraftFilters((current) => ({
                            ...current,
                            salary_min: minimum,
                            salary_max: maximum,
                        }))
                    }
                    onSalaryRangeEnabledChange={setSalaryRangeEnabled}
                    onApply={applyFilters}
                    onClear={clearFilters}
                />

                <section className="grid gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-medium">
                            {applications.total === 1
                                ? '1 application'
                                : filters.search || activeFilterCount > 0
                                  ? `${applications.total} applications found`
                                  : `${applications.total} applications`}
                        </h2>
                        <p
                            className="text-sm text-muted-foreground"
                            aria-live="polite"
                        >
                            {loading ? 'Updating results…' : ''}
                        </p>
                    </div>

                    {applications.data.length > 0 ? (
                        <>
                            <JobApplicationTable
                                applications={applications.data}
                            />
                            <nav
                                aria-label="Application pages"
                                className="flex flex-wrap justify-center gap-1"
                            >
                                {applications.links.map((link, index) =>
                                    link.url ? (
                                        <Link
                                            key={`${link.label}-${index}`}
                                            href={link.url}
                                            preserveScroll
                                            className={`inline-flex min-w-9 items-center justify-center rounded-md border px-3 py-2 text-sm ${
                                                link.active
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'hover:bg-accent-muted'
                                            }`}
                                        >
                                            {link.label
                                                .replaceAll('&laquo;', '«')
                                                .replaceAll('&raquo;', '»')}
                                        </Link>
                                    ) : (
                                        <span
                                            key={`${link.label}-${index}`}
                                            aria-disabled="true"
                                            className="inline-flex min-w-9 items-center justify-center rounded-md border px-3 py-2 text-sm text-muted-foreground opacity-50"
                                        >
                                            {link.label
                                                .replaceAll('&laquo;', '«')
                                                .replaceAll('&raquo;', '»')}
                                        </span>
                                    ),
                                )}
                            </nav>
                        </>
                    ) : (
                        <div className="grid min-h-48 place-items-center rounded-card border border-dashed bg-card px-4 py-8 text-center shadow-card sm:px-6 sm:py-10">
                            <div className="grid max-w-md gap-2">
                                <h3 className="font-semibold">
                                    {hasApplications
                                        ? 'No job applications match your search.'
                                        : 'No job applications yet.'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {hasApplications
                                        ? 'Try changing or clearing your filters.'
                                        : 'Add your first job application to start tracking your search.'}
                                </p>
                                {hasApplications ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="mx-auto mt-2"
                                    >
                                        Clear filters
                                    </Button>
                                ) : (
                                    <Button asChild className="mx-auto mt-2">
                                        <Link href={createApplication()}>
                                            Add your first application
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

JobApplicationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Job applications',
            href: applicationsIndex(),
        },
    ],
};
