import { Badge } from '@/components/ui/badge';
import type { JobApplicationStatus } from '@/types/job-application';

const statusStyles: Record<JobApplicationStatus, string> = {
    SAVED: 'border-primary-background bg-primary-background text-primary',
    APPLIED: 'border-primary-background bg-primary-background text-primary',
    UNDER_REVIEW: 'border-info-border bg-info-background text-info',
    INTERVIEW: 'border-interview-border bg-interview-background text-interview',
    TECHNICAL_EXAM:
        'border-interview-border bg-interview-background text-interview',
    TECHNICAL_INTERVIEW:
        'border-interview-border bg-interview-background text-interview',
    FINAL_INTERVIEW:
        'border-interview-border bg-interview-background text-interview',
    OFFER: 'border-success-border bg-success-background text-success',
    ACCEPTED: 'border-success-border bg-success-background text-success',
    REJECTED: 'border-danger-border bg-danger-background text-danger',
    WITHDRAWN: 'border-border-strong bg-surface-muted text-foreground-muted',
};

function labelForStatus(status: JobApplicationStatus): string {
    return status
        .toLowerCase()
        .split('_')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ');
}

export function StatusBadge({ status }: { status: JobApplicationStatus }) {
    return (
        <Badge variant="outline" className={statusStyles[status]}>
            {labelForStatus(status)}
        </Badge>
    );
}
