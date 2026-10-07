export type JobApplicationStatus =
    | 'SAVED'
    | 'APPLIED'
    | 'UNDER_REVIEW'
    | 'INTERVIEW'
    | 'TECHNICAL_EXAM'
    | 'TECHNICAL_INTERVIEW'
    | 'FINAL_INTERVIEW'
    | 'OFFER'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN';

export type JobApplicationWorkSetup = 'ONSITE' | 'HYBRID' | 'WORK_FROM_HOME';

export type JobApplicationExperienceLevel =
    | 'ENTRY'
    | 'JUNIOR'
    | 'MID'
    | 'SENIOR'
    | 'LEAD'
    | 'MANAGER'
    | 'DIRECTOR'
    | 'EXECUTIVE';

export type JobApplicationSalaryPeriod = 'MONTHLY' | 'YEARLY';

export type SelectOption<T extends string = string> = {
    value: T;
    label: string;
};

export type JobApplication = {
    id: string;
    company_name: string;
    company_address: string | null;
    title: string;
    url: string;
    content: string | null;
    status: JobApplicationStatus;
    work_setup: JobApplicationWorkSetup;
    experience_level: JobApplicationExperienceLevel | null;
    salary_min: string | null;
    salary_max: string | null;
    salary_period: JobApplicationSalaryPeriod | null;
    salary_currency: string | null;
    notes: string | null;
    applied_at: string | null;
    created_at: string;
    updated_at: string;
};

export type JobApplicationFilters = {
    search?: string;
    status?: JobApplicationStatus;
    work_setup?: JobApplicationWorkSetup;
    experience_level?: JobApplicationExperienceLevel;
    salary_period?: JobApplicationSalaryPeriod;
    salary_currency?: string;
    salary_min?: string | number;
    salary_max?: string | number;
    per_page?: string | number;
};

export type JobApplicationFilterOptions = {
    statuses: SelectOption<JobApplicationStatus>[];
    workSetups: SelectOption<JobApplicationWorkSetup>[];
    experienceLevels: SelectOption<JobApplicationExperienceLevel>[];
    salaryPeriods: SelectOption<JobApplicationSalaryPeriod>[];
    currencies: string[];
};

export type JobApplicationFormOptions = Omit<
    JobApplicationFilterOptions,
    'currencies'
>;

export type SalaryBounds = {
    minimum: number | null;
    maximum: number | null;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};
