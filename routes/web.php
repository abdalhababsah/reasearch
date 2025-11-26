<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ResearchController as AdminResearchController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Researcher\ResearchController as ResearcherResearchController;
use App\Http\Controllers\ResearcherProfileController;
use App\Http\Middleware\EnsureResearcherProfileComplete;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/researches', [HomeController::class, 'researches'])->name('public.researches.index');
Route::get('/researches/{research}', [HomeController::class, 'showResearch'])->name('public.researches.show');
Route::get('/researchers', [HomeController::class, 'researchers'])->name('public.researchers.index');
Route::get('/researchers/{researcher}', [HomeController::class, 'showResearcher'])->name('public.researchers.show');
Route::get('/contact', [HomeController::class, 'contact'])->name('public.contact');
Route::post('/contact', [HomeController::class, 'submitContact'])->name('public.contact.submit');

Route::post('language', [LanguageController::class, 'update'])->name('language.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'admin'])->name('dashboard');
        Route::resource('categories', CategoryController::class);
        Route::resource('tags', TagController::class);
        Route::resource('researches', AdminResearchController::class)->only(['index', 'show', 'update']);
    });
    
    // Researcher routes with profile completion check
    Route::middleware([EnsureResearcherProfileComplete::class])->group(function () {
        Route::get('researcher/dashboard', [DashboardController::class, 'researcher'])->name('researcher.dashboard');
        
        Route::prefix('researcher')->name('researcher.')->group(function () {
            Route::resource('researches', ResearcherResearchController::class);
        });
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
