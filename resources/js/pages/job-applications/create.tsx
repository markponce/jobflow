import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { JobApplicationForm } from '@/components/job-applications/job-application-form';
import type { JobApplicationFormOptions } from '@/types/job-application';
import { create as createApplication } from '@/routes/job-applications';

export default function CreateJobApplication({
    options,
}: {
    options: JobApplicationFormOptions;
}) {
    return (
        <>
            <Head title="Add job application" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Add job application"
                    description="Save the role details and start tracking your progress."
                />
                <JobApplicationForm options={options} />
            </main>
        </>
    );
}

CreateJobApplication.layout = {
    breadcrumbs: [
        {
            title: 'Add application',
            href: createApplication(),
        },
    ],
};
