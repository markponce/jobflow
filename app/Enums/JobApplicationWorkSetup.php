<?php

namespace App\Enums;

enum JobApplicationWorkSetup: string
{
    case Onsite = 'ONSITE';
    case Hybrid = 'HYBRID';
    case WorkFromHome = 'WORK_FROM_HOME';

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
            static fn (self $workSetup): array => [
                'value' => $workSetup->value,
                'label' => $workSetup->label(),
            ],
            self::cases(),
        );
    }
}
