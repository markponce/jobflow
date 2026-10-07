import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import type { JobApplicationStatus } from '@/types/job-application';

type Props = {
    statusCounts: {
        value: JobApplicationStatus;
        label: string;
        count: number;
    }[];
};

export default function Dashboard({ statusCounts }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <header className="grid gap-1">
                    <p className="text-sm font-medium text-primary">
                        Career workspace
                    </p>
                    <h1 className="text-h1">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Your job applications grouped by status.
                    </p>
                </header>

                <section
                    aria-labelledby="application-status-heading"
                    className="grid gap-4"
                >
                    <h2 id="application-status-heading" className="text-h2">
                        Applications by status
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {statusCounts.map((status) => (
                            <article
                                key={status.value}
                                className="grid gap-3 rounded-card border bg-card p-4 shadow-card"
                            >
                                <h3 className="text-body-small font-medium text-foreground-muted">
                                    {status.label}
                                </h3>
                                <p className="text-3xl font-semibold tabular-nums">
                                    {status.count}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
