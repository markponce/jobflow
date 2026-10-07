import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SalaryRangeFilter } from '@/components/job-applications/salary-range-filter';
import type {
    JobApplicationFilterOptions,
    SalaryBounds,
    SelectOption,
} from '@/types/job-application';

export type DraftFilters = {
    status: string;
    work_setup: string;
    experience_level: string;
    salary_period: string;
    salary_currency: string;
    salary_min: number;
    salary_max: number;
    per_page: string;
};

type Props = {
    search: string;
    filters: DraftFilters;
    options: JobApplicationFilterOptions;
    bounds: SalaryBounds;
    salaryBoundsAreCurrent: boolean;
    salaryRangeEnabled: boolean;
    loading: boolean;
    activeFilterCount: number;
    onSearchChange: (search: string) => void;
    onFilterChange: (name: keyof DraftFilters, value: string) => void;
    onSalaryRangeChange: (minimum: number, maximum: number) => void;
    onSalaryRangeEnabledChange: (enabled: boolean) => void;
    onApply: () => void;
    onClear: () => void;
};

function FilterSelect({
    id,
    label,
    value,
    options,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
                <option value="">
                    {label === 'Status'
                        ? 'All statuses'
                        : `All ${label.toLowerCase()}s`}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export function JobApplicationFilters({
    search,
    filters,
    options,
    bounds,
    salaryBoundsAreCurrent,
    salaryRangeEnabled,
    loading,
    activeFilterCount,
    onSearchChange,
    onFilterChange,
    onSalaryRangeChange,
    onSalaryRangeEnabledChange,
    onApply,
    onClear,
}: Props) {
    const hasMultipleCurrencies = options.currencies.length > 1;
    const selectedCurrency = filters.salary_currency;
    const salaryCurrency =
        selectedCurrency ||
        (options.currencies.length === 1 ? options.currencies[0] : '');
    const currencyRequired = hasMultipleCurrencies && !selectedCurrency;

    return (
        <section className="grid gap-4 rounded-card border bg-card p-4 shadow-card sm:gap-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <div className="grid gap-2 md:col-span-2 xl:col-span-3">
                    <Label htmlFor="application-search">
                        Search applications
                    </Label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="application-search"
                            value={search}
                            onChange={(event) =>
                                onSearchChange(event.target.value)
                            }
                            placeholder="Search company, title, description…"
                            className="pl-9"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Search is debounced. Use the filters below for exact
                        criteria.
                    </p>
                </div>

                <FilterSelect
                    id="filter-status"
                    label="Status"
                    value={filters.status}
                    options={options.statuses}
                    onChange={(value) => onFilterChange('status', value)}
                />
                <FilterSelect
                    id="filter-work-setup"
                    label="Work setup"
                    value={filters.work_setup}
                    options={options.workSetups}
                    onChange={(value) => onFilterChange('work_setup', value)}
                />
                <FilterSelect
                    id="filter-experience"
                    label="Experience level"
                    value={filters.experience_level}
                    options={options.experienceLevels}
                    onChange={(value) =>
                        onFilterChange('experience_level', value)
                    }
                />
                <FilterSelect
                    id="filter-salary-period"
                    label="Salary period"
                    value={filters.salary_period}
                    options={options.salaryPeriods}
                    onChange={(value) => onFilterChange('salary_period', value)}
                />
                <div className="grid gap-2">
                    <Label htmlFor="filter-currency">Currency</Label>
                    <select
                        id="filter-currency"
                        value={selectedCurrency}
                        onChange={(event) =>
                            onFilterChange(
                                'salary_currency',
                                event.target.value,
                            )
                        }
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <option value="">All currencies</option>
                        {options.currencies.map((currency) => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="rounded-lg border p-3 md:col-span-2 xl:col-span-1">
                    <SalaryRangeFilter
                        bounds={bounds}
                        boundsAreCurrent={salaryBoundsAreCurrent}
                        currency={salaryCurrency}
                        minimum={filters.salary_min}
                        maximum={filters.salary_max}
                        enabled={salaryRangeEnabled}
                        onEnabledChange={onSalaryRangeEnabledChange}
                        onRangeChange={onSalaryRangeChange}
                        currencyRequired={currencyRequired}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="filter-page-size">Results per page</Label>
                    <select
                        id="filter-page-size"
                        value={filters.per_page}
                        onChange={(event) =>
                            onFilterChange('per_page', event.target.value)
                        }
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        {Array.from({ length: 10 }, (_, index) => {
                            const pageSize = (index + 1) * 10;

                            return (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                <button
                    type="button"
                    onClick={onApply}
                    disabled={
                        loading || (salaryRangeEnabled && currencyRequired)
                    }
                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-button font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover active:bg-primary-active disabled:pointer-events-none disabled:opacity-50"
                >
                    {loading ? 'Applying…' : 'Apply filters'}
                </button>
                <button
                    type="button"
                    onClick={onClear}
                    disabled={
                        loading ||
                        (activeFilterCount === 0 && filters.per_page === '10')
                    }
                    className="inline-flex h-11 items-center justify-center rounded-md border border-input-border bg-surface px-4 text-button font-semibold transition-colors hover:bg-accent-muted hover:text-accent-muted-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                    Clear all
                </button>
                {activeFilterCount > 0 && (
                    <span className="text-sm text-muted-foreground">
                        {activeFilterCount} active filter
                        {activeFilterCount === 1 ? '' : 's'}
                    </span>
                )}
            </div>
        </section>
    );
}
