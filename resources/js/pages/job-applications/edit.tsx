import { Head, setLayoutProps } from '@inertiajs/react';
import Heading from '@/components/heading';
import { JobApplicationForm } from '@/components/job-applications/job-application-form';
import type { BreadcrumbItem } from '@/types';
import type {
    JobApplication,
    JobApplicationFormOptions,
} from '@/types/job-application';
import {
    edit as editApplication,
    index as applicationsIndex,
    show as showApplication,
} from '@/routes/job-applications';

export default function EditJobApplication({
    application,
    options,
}: {
    application: JobApplication;
    options: JobApplicationFormOptions;
}) {
    setLayoutProps<{ breadcrumbs: BreadcrumbItem[] }>({
        breadcrumbs: [
            {
                title: 'Job applications',
                href: applicationsIndex(),
            },
            {
                title: application.title,
                href: showApplication(application.id),
            },
            {
                title: 'Edit application',
                href: editApplication(application.id),
            },
        ],
    });

    return (
        <>
            <Head title={`Edit ${application.title}`} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Edit application"
                    description={`${application.title} at ${application.company_name}`}
                />
                <JobApplicationForm
                    application={application}
                    options={options}
                />
            </main>
        </>
    );
}
