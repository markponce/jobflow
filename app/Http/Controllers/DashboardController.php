<?php

namespace App\Http\Controllers;

use App\Enums\JobApplicationStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $counts = $user->jobApplications()
            ->select('status')
            ->selectRaw('COUNT(*) AS application_count')
            ->groupBy('status')
            ->toBase()
            ->pluck('application_count', 'status');

        $statusCounts = array_map(
            static fn (JobApplicationStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
                'count' => (int) $counts->get($status->value, 0),
            ],
            JobApplicationStatus::cases(),
        );

        return Inertia::render('dashboard', [
            'statusCounts' => $statusCounts,
        ]);
    }
}
