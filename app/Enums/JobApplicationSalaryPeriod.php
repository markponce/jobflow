<?php

namespace App\Enums;

enum JobApplicationSalaryPeriod: string
{
    case Monthly = 'MONTHLY';
    case Yearly = 'YEARLY';

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
            static fn (self $period): array => [
                'value' => $period->value,
                'label' => $period->label(),
            ],
            self::cases(),
        );
    }
}
