<?php

namespace App\Enums;

enum JobApplicationStatus: string
{
    case Saved = 'SAVED';
    case Applied = 'APPLIED';
    case UnderReview = 'UNDER_REVIEW';
    case Interview = 'INTERVIEW';
    case TechnicalExam = 'TECHNICAL_EXAM';
    case TechnicalInterview = 'TECHNICAL_INTERVIEW';
    case FinalInterview = 'FINAL_INTERVIEW';
    case Offer = 'OFFER';
    case Accepted = 'ACCEPTED';
    case Rejected = 'REJECTED';
    case Withdrawn = 'WITHDRAWN';

    public function label(): string
    {
        return ucwords(strtolower(str_replace('_', ' ', $this->value)));
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            self::cases(),
        );
    }
}
