import { Form, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import JobApplicationController from '@/actions/App/Http/Controllers/JobApplicationController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    JobApplication,
    JobApplicationFormOptions,
    SelectOption,
} from '@/types/job-application';
import { index as applicationsIndex } from '@/routes/job-applications';

type Props = {
    application?: JobApplication;
    options: JobApplicationFormOptions;
};

type FormErrors = Record<string, string | undefined>;

const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });
const currencyOptions: SelectOption[] = Intl.supportedValuesOf('currency')
    .map((currency) => {
        const name = currencyNames.of(currency);

        return {
            value: currency,
            label: name ? `${name} (${currency})` : currency,
        };
    })
    .sort((first, second) => first.label.localeCompare(second.label));

function formatDateTimeLocal(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16);
}

function SelectField({
    id,
    label,
    name,
    options,
    value,
    error,
}: {
    id: string;
    label: string;
    name: string;
    options: SelectOption[];
    value: string;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <select
                id={id}
                name={name}
                defaultValue={value}
                required={name === 'status' || name === 'work_setup'}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
            >
                {!value && <option value="">Not specified</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="">
                <InputError id={`${id}-error`} message={error} />
            </div>
        </div>
    );
}

function TextField({
    id,
    label,
    name,
    value,
    type = 'text',
    required = false,
    error,
    placeholder,
}: {
    id: string;
    label: string;
    name: string;
    value: string;
    type?: string;
    required?: boolean;
    error?: string;
    placeholder?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={name}
                type={type}
                defaultValue={value}
                required={required}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                step={type === 'number' ? '0.01' : undefined}
                min={type === 'number' ? '0' : undefined}
            />
            <div className="">
                <InputError id={`${id}-error`} message={error} />
            </div>
        </div>
    );
}

function TextAreaField({
    id,
    label,
    name,
    value,
    error,
    rows = 4,
}: {
    id: string;
    label: string;
    name: string;
    value: string;
    error?: string;
    rows?: number;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <textarea
                id={id}
                name={name}
                defaultValue={value}
                rows={rows}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
            />
            <div className="">
                <InputError id={`${id}-error`} message={error} />
            </div>
        </div>
    );
}

function FormFields({
    application,
    options,
    errors,
    processing,
    isDirty,
}: {
    application?: JobApplication;
    options: JobApplicationFormOptions;
    errors: FormErrors;
    processing: boolean;
    isDirty: boolean;
}) {
    useEffect(() => {
        if (!isDirty) {
            return;
        }

        const removeBeforeListener = router.on('before', (event) => {
            if (
                event.detail.visit.method === 'get' &&
                !window.confirm('You have unsaved changes. Leave this page?')
            ) {
                return false;
            }
        });
        const preventUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', preventUnload);

        return () => {
            removeBeforeListener();
            window.removeEventListener('beforeunload', preventUnload);
        };
    }, [isDirty]);

    const salaryCurrency = application?.salary_currency ?? '';
    const salaryCurrencyOptions =
        salaryCurrency &&
        !currencyOptions.some((option) => option.value === salaryCurrency)
            ? [
                  {
                      value: salaryCurrency,
                      label: salaryCurrency,
                  },
                  ...currencyOptions,
              ]
            : currencyOptions;

    return (
        <>
            <section className="grid gap-4 rounded-card border bg-card p-4 shadow-card sm:gap-5 sm:p-6">
                <div>
                    <h2 className="text-h3">Basic information</h2>
                    <p className="text-sm text-muted-foreground">
                        Company and role details from the job listing.
                    </p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                    <TextField
                        id="company_name"
                        label="Company name"
                        name="company_name"
                        value={application?.company_name ?? ''}
                        required
                        error={errors.company_name}
                    />
                    <TextField
                        id="title"
                        label="Job title"
                        name="title"
                        value={application?.title ?? ''}
                        required
                        error={errors.title}
                    />
                    <TextField
                        id="url"
                        label="Job URL"
                        name="url"
                        type="url"
                        value={application?.url ?? ''}
                        required
                        error={errors.url}
                        placeholder="https://example.com/jobs/role"
                    />
                    <TextField
                        id="company_address"
                        label="Company address"
                        name="company_address"
                        value={application?.company_address ?? ''}
                        error={errors.company_address}
                    />
                </div>
            </section>

            <section className="grid gap-4 rounded-card border bg-card p-4 shadow-card sm:gap-5 sm:p-6">
                <div>
                    <h2 className="text-h3">Job details</h2>
                    <p className="text-sm text-muted-foreground">
                        Track your progress and the working arrangement.
                    </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <SelectField
                        id="status"
                        label="Status"
                        name="status"
                        options={options.statuses}
                        value={application?.status ?? 'SAVED'}
                        error={errors.status}
                    />
                    <SelectField
                        id="work_setup"
                        label="Work setup"
                        name="work_setup"
                        options={options.workSetups}
                        value={application?.work_setup ?? 'ONSITE'}
                        error={errors.work_setup}
                    />
                    <SelectField
                        id="experience_level"
                        label="Experience level"
                        name="experience_level"
                        options={options.experienceLevels}
                        value={application?.experience_level ?? ''}
                        error={errors.experience_level}
                    />
                </div>
            </section>

            <section className="grid gap-4 rounded-card border bg-card p-4 shadow-card sm:gap-5 sm:p-6">
                <div>
                    <h2 className="text-h3">Salary</h2>
                    <p className="text-sm text-muted-foreground">
                        Add a range and currency when the listing includes
                        compensation.
                    </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <TextField
                        id="salary_min"
                        label="Minimum"
                        name="salary_min"
                        type="number"
                        value={application?.salary_min ?? ''}
                        error={errors.salary_min}
                    />
                    <TextField
                        id="salary_max"
                        label="Maximum"
                        name="salary_max"
                        type="number"
                        value={application?.salary_max ?? ''}
                        error={errors.salary_max}
                    />
                    <SelectField
                        id="salary_period"
                        label="Salary period"
                        name="salary_period"
                        options={options.salaryPeriods}
                        value={application?.salary_period ?? ''}
                        error={errors.salary_period}
                    />
                    <SelectField
                        id="salary_currency"
                        label="Currency"
                        name="salary_currency"
                        options={salaryCurrencyOptions}
                        value={salaryCurrency}
                        error={errors.salary_currency}
                    />
                </div>
            </section>

            <section className="grid gap-4 rounded-card border bg-card p-4 shadow-card sm:gap-5 sm:p-6">
                <div>
                    <h2 className="text-h3">Application notes</h2>
                    <p className="text-sm text-muted-foreground">
                        Record when you applied and keep notes for later.
                    </p>
                </div>
                <div className="grid gap-5">
                    <TextField
                        id="applied_at"
                        label="Applied at"
                        name="applied_at"
                        type="datetime-local"
                        value={formatDateTimeLocal(application?.applied_at)}
                        error={errors.applied_at}
                    />
                    <TextAreaField
                        id="notes"
                        label="Notes"
                        name="notes"
                        value={application?.notes ?? ''}
                        error={errors.notes}
                    />
                    <TextAreaField
                        id="content"
                        label="Job description"
                        name="content"
                        value={application?.content ?? ''}
                        error={errors.content}
                        rows={8}
                    />
                </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={processing}>
                    {processing
                        ? 'Saving…'
                        : application
                          ? 'Save changes'
                          : 'Create application'}
                </Button>
                <Button asChild type="button" variant="outline">
                    <Link href={applicationsIndex()}>Cancel</Link>
                </Button>
            </div>
        </>
    );
}

export function JobApplicationForm({ application, options }: Props) {
    const action = application
        ? JobApplicationController.update.form(application.id)
        : JobApplicationController.store.form();

    return (
        <Form
            {...action}
            options={{ preserveScroll: true }}
            className="grid gap-5"
        >
            {({ errors, processing, isDirty }) => (
                <FormFields
                    application={application}
                    options={options}
                    errors={errors}
                    processing={processing}
                    isDirty={isDirty}
                />
            )}
        </Form>
    );
}
