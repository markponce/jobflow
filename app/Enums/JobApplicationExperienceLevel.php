<?php

namespace App\Enums;

enum JobApplicationExperienceLevel: string
{
    case Entry = 'ENTRY';
    case Junior = 'JUNIOR';
    case Mid = 'MID';
    case Senior = 'SENIOR';
    case Lead = 'LEAD';
    case Manager = 'MANAGER';
    case Director = 'DIRECTOR';
    case Executive = 'EXECUTIVE';

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
            static fn (self $level): array => [
                'value' => $level->value,
                'label' => $level->label(),
            ],
            self::cases(),
        );
    }
}
