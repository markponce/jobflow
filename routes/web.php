<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JobApplicationController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::resource('job-applications', JobApplicationController::class);
});

require __DIR__.'/settings.php';
