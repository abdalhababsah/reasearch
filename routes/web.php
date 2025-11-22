<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\ResearcherProfileController;
use App\Http\Middleware\EnsureResearcherProfileComplete;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::post('language', [LanguageController::class, 'update'])->name('language.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'admin'])->name('dashboard');
        Route::resource('categories', CategoryController::class);
        Route::resource('tags', TagController::class);
    });
    
    // Researcher routes with profile completion check
    Route::middleware([EnsureResearcherProfileComplete::class])->group(function () {
        Route::get('researcher/dashboard', [DashboardController::class, 'researcher'])->name('researcher.dashboard');
    });
    
    // Researcher profile routes (excluded from profile completion check)
    Route::prefix('researcher/profile')->name('researcher.profile.')->group(function () {
        Route::get('edit', function () {
            return redirect()->route('profile.edit');
        })->name('edit');
        Route::patch('update', [ResearcherProfileController::class, 'update'])->name('update');
        Route::post('experiences', [ResearcherProfileController::class, 'storeExperience'])->name('experiences.store');
        Route::patch('experiences/{experience}', [ResearcherProfileController::class, 'updateExperience'])->name('experiences.update');
        Route::delete('experiences/{experience}', [ResearcherProfileController::class, 'destroyExperience'])->name('experiences.destroy');
        Route::post('educations', [ResearcherProfileController::class, 'storeEducation'])->name('educations.store');
        Route::patch('educations/{education}', [ResearcherProfileController::class, 'updateEducation'])->name('educations.update');
        Route::delete('educations/{education}', [ResearcherProfileController::class, 'destroyEducation'])->name('educations.destroy');
    });
});

require __DIR__.'/settings.php';
