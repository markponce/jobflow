import { Link, router } from '@inertiajs/react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import JobApplicationController from '@/actions/App/Http/Controllers/JobApplicationController';
import { StatusBadge } from '@/components/job-applications/status-badge';
import { Button } from '@/components/ui/button';
import type { JobApplication } from '@/types/job-application';
import {
    edit as editApplication,
    show as showApplication,
} from '@/routes/job-applications';

function formatSalary(application: JobApplication): string {
    const minimum =
        application.salary_min === null ? null : Number(application.salary_min);
    const maximum =
        application.salary_max === null ? null : Number(application.salary_max);

    if (minimum === null && maximum === null) {
        return 'Not specified';
    }

    const formatter = application.salary_currency
        ? new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: application.salary_currency,
              maximumFractionDigits: 0,
          })
        : new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
    const format = (amount: number) => formatter.format(amount);
    const range =
        minimum !== null && maximum !== null
            ? `${format(minimum)} – ${format(maximum)}`
            : minimum !== null
              ? `From ${format(minimum)}`
              : `Up to ${format(maximum!)}`;

    return `${range}${application.salary_period ? ` / ${application.salary_period.toLowerCase()}` : ''}`;
}

function formatDate(value: string | null): string {
    return value
        ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
              new Date(value),
          )
        : '—';
}

export function JobApplicationTable({
    applications,
}: {
    applications: JobApplication[];
}) {
    function deleteApplication(application: JobApplication) {
        router.delete(JobApplicationController.destroy.url(application.id), {
            preserveScroll: true,
            onBefore: () =>
                window.confirm(
                    `Delete the application for ${application.company_name}? This cannot be undone.`,
                ),
        });
    }

    return (
        <div className="overflow-x-auto rounded-card border bg-card shadow-card">
            <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
                    <tr>
                        <th className="px-4 py-3 font-medium">
                            Company / role
                        </th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Work setup</th>
                        <th className="px-4 py-3 font-medium">Experience</th>
                        <th className="px-4 py-3 font-medium">Salary</th>
                        <th className="px-4 py-3 font-medium">Applied</th>
                        <th className="px-4 py-3 font-medium">Created</th>
                        <th className="px-4 py-3 text-right font-medium">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {applications.map((application) => (
                        <tr
                            key={application.id}
                            className="transition-colors hover:bg-muted/30"
                        >
                            <td className="px-4 py-3">
                                <Link
                                    href={showApplication(application.id)}
                                    className="font-medium hover:underline"
                                >
                                    {application.title}
                                </Link>
                                <p className="text-muted-foreground">
                                    {application.company_name}
                                </p>
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge status={application.status} />
                            </td>
                            <td className="px-4 py-3">
                                {application.work_setup
                                    .toLowerCase()
                                    .split('_')
                                    .map(
                                        (word) =>
                                            word[0].toUpperCase() +
                                            word.slice(1),
                                    )
                                    .join(' ')}
                            </td>
                            <td className="px-4 py-3">
                                {application.experience_level ?? '—'}
                            </td>
                            <td className="px-4 py-3">
                                {formatSalary(application)}
                            </td>
                            <td className="px-4 py-3">
                                {formatDate(application.applied_at)}
                            </td>
                            <td className="px-4 py-3">
                                {formatDate(application.created_at)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`View ${application.title}`}
                                    >
                                        <Link
                                            href={showApplication(
                                                application.id,
                                            )}
                                        >
                                            <ExternalLink />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Edit ${application.title}`}
                                    >
                                        <Link
                                            href={editApplication(
                                                application.id,
                                            )}
                                        >
                                            <Pencil />
                                        </Link>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Delete ${application.title}`}
                                        onClick={() =>
                                            deleteApplication(application)
                                        }
                                    >
                                        <Trash2 className="text-destructive" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
