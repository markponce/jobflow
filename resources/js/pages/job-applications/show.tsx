import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import JobApplicationController from '@/actions/App/Http/Controllers/JobApplicationController';
import { StatusBadge } from '@/components/job-applications/status-badge';
import { Button } from '@/components/ui/button';
import type { JobApplication } from '@/types/job-application';
import {
    edit as editApplication,
    index as applicationsIndex,
} from '@/routes/job-applications';

function formatDate(value: string | null): string {
    return value ? new Date(value).toLocaleString() : 'Not provided';
}

function formatSalary(application: JobApplication): string {
    const minimum =
        application.salary_min === null ? null : Number(application.salary_min);
    const maximum =
        application.salary_max === null ? null : Number(application.salary_max);

    if (minimum === null && maximum === null) {
        return 'Not provided';
    }

    const formatter = application.salary_currency
        ? new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: application.salary_currency,
              maximumFractionDigits: 2,
          })
        : new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
    const range =
        minimum !== null && maximum !== null
            ? `${formatter.format(minimum)} – ${formatter.format(maximum)}`
            : minimum !== null
              ? `From ${formatter.format(minimum)}`
              : `Up to ${formatter.format(maximum ?? 0)}`;

    return `${range}${application.salary_period ? ` per ${application.salary_period === 'MONTHLY' ? 'month' : 'year'}` : ''}`;
}

function Detail({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-1">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className="text-sm break-words">
                {children || 'Not provided'}
            </dd>
        </div>
    );
}

export default function ShowJobApplication({
    application,
}: {
    application: JobApplication;
}) {
    const [deleting, setDeleting] = useState(false);

    function deleteApplication() {
        router.delete(JobApplicationController.destroy.url(application.id), {
            preserveScroll: true,
            onBefore: () =>
                window.confirm(
                    `Delete the application for ${application.company_name}? This cannot be undone.`,
                ),
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head
                title={`${application.title} at ${application.company_name}`}
            />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="grid gap-2">
                        <Link
                            href={applicationsIndex()}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to applications
                        </Link>
                        <div className="grid gap-1">
                            <p className="text-sm text-muted-foreground">
                                {application.company_name}
                            </p>
                            <h1 className="text-h1">{application.title}</h1>
                            <StatusBadge status={application.status} />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <a
                                href={application.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <ExternalLink />
                                Open job listing
                            </a>
                        </Button>
                        <Button asChild>
                            <Link href={editApplication(application.id)}>
                                <Pencil />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={deleting}
                            onClick={deleteApplication}
                        >
                            <Trash2 />
                            {deleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </div>
                </div>

                <section className="grid gap-4 rounded-card border bg-card p-4 shadow-card sm:gap-6 sm:p-6">
                    <h2 className="font-semibold">Application details</h2>
                    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        <Detail label="Company">
                            {application.company_name}
                        </Detail>
                        <Detail label="Company address">
                            {application.company_address}
                        </Detail>
                        <Detail label="Job title">{application.title}</Detail>
                        <Detail label="Job URL">
                            <a
                                href={application.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline underline-offset-4"
                            >
                                {application.url}
                            </a>
                        </Detail>
                        <Detail label="Work setup">
                            {application.work_setup
                                .toLowerCase()
                                .split('_')
                                .map(
                                    (word) =>
                                        word[0].toUpperCase() + word.slice(1),
                                )
                                .join(' ')}
                        </Detail>
                        <Detail label="Experience level">
                            {application.experience_level
                                ?.toLowerCase()
                                .replace(/^\w/, (letter) =>
                                    letter.toUpperCase(),
                                )}
                        </Detail>
                        <Detail label="Salary">
                            {formatSalary(application)}
                        </Detail>
                        <Detail label="Applied at">
                            {formatDate(application.applied_at)}
                        </Detail>
                        <Detail label="Created at">
                            {formatDate(application.created_at)}
                        </Detail>
                        <Detail label="Updated at">
                            {formatDate(application.updated_at)}
                        </Detail>
                    </dl>
                </section>

                <section className="grid gap-3 rounded-card border bg-card p-4 shadow-card sm:p-6">
                    <h2 className="font-semibold">Notes</h2>
                    <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                        {application.notes || 'No notes added.'}
                    </p>
                </section>

                <section className="grid gap-3 rounded-card border bg-card p-4 shadow-card sm:p-6">
                    <h2 className="font-semibold">Job description</h2>
                    <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
                        {application.content || 'No job description saved.'}
                    </p>
                </section>
            </main>
        </>
    );
}

ShowJobApplication.layout = {
    breadcrumbs: [
        {
            title: 'Application details',
            href: applicationsIndex(),
        },
    ],
};
