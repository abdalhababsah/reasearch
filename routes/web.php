<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ResearchController as AdminResearchController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Researcher\ResearchController as ResearcherResearchController;
use App\Http\Controllers\Researcher\ResearcherAudioController;
use App\Http\Controllers\Researcher\ResearcherAudioLabelController;
use App\Http\Controllers\Researcher\ResearcherAudioSegmentController;
use App\Http\Controllers\Researcher\ResearcherImageController;
use App\Http\Controllers\Researcher\ResearcherImageLabelController;
use App\Http\Controllers\Researcher\ResearcherImageAnnotationController;
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
            
            // Audio Management Routes
            Route::prefix('audios')->name('audios.')->group(function () {
                Route::get('/', [ResearcherAudioController::class, 'index'])->name('index');
                Route::post('/', [ResearcherAudioController::class, 'store'])->name('store');
                Route::get('/{audio}', [ResearcherAudioController::class, 'show'])->name('show');
                Route::put('/{audio}', [ResearcherAudioController::class, 'update'])->name('update');
                Route::delete('/{audio}', [ResearcherAudioController::class, 'destroy'])->name('destroy');
                
                // Audio Segmentation Routes
                Route::get('/{audio}/label', [ResearcherAudioSegmentController::class, 'edit'])->name('label');
                Route::put('/{audio}/segments', [ResearcherAudioSegmentController::class, 'update'])->name('segments.update');
                Route::get('/{audio}/segments', [ResearcherAudioSegmentController::class, 'index'])->name('segments.index');
                Route::get('/{audio}/export', [ResearcherAudioSegmentController::class, 'export'])->name('export');
            });
            
            // Audio Label Management Routes
            Route::prefix('audios/{audio}/labels')->name('audios.labels.')->group(function () {
                Route::get('/', [ResearcherAudioLabelController::class, 'index'])->name('index');
                Route::post('/', [ResearcherAudioLabelController::class, 'store'])->name('store');
                Route::put('/{label}', [ResearcherAudioLabelController::class, 'update'])->name('update');
                Route::delete('/{label}', [ResearcherAudioLabelController::class, 'destroy'])->name('destroy');
                Route::patch('/{label}/toggle-active', [ResearcherAudioLabelController::class, 'toggleActive'])->name('toggle-active');
            });

            // Image Management Routes
            Route::prefix('images')->name('images.')->group(function () {
                Route::get('/', [ResearcherImageController::class, 'index'])->name('index');
                Route::post('/', [ResearcherImageController::class, 'store'])->name('store');
                Route::get('/{image}', [ResearcherImageController::class, 'show'])->name('show');
                Route::put('/{image}', [ResearcherImageController::class, 'update'])->name('update');
                Route::delete('/{image}', [ResearcherImageController::class, 'destroy'])->name('destroy');
                
                // Image Annotation Routes
                Route::get('/{image}/annotate', [ResearcherImageAnnotationController::class, 'edit'])->name('annotate');
                Route::put('/{image}/annotations', [ResearcherImageAnnotationController::class, 'update'])->name('annotations.update');
                Route::get('/{image}/annotations', [ResearcherImageAnnotationController::class, 'index'])->name('annotations.index');
                Route::get('/{image}/export', [ResearcherImageAnnotationController::class, 'export'])->name('export');
            });
            
            // Image Label Management Routes
            Route::prefix('images/{image}/labels')->name('images.labels.')->group(function () {
                Route::get('/', [ResearcherImageLabelController::class, 'index'])->name('index');
                Route::post('/', [ResearcherImageLabelController::class, 'store'])->name('store');
                Route::put('/{label}', [ResearcherImageLabelController::class, 'update'])->name('update');
                Route::delete('/{label}', [ResearcherImageLabelController::class, 'destroy'])->name('destroy');
                Route::patch('/{label}/toggle-active', [ResearcherImageLabelController::class, 'toggleActive'])->name('toggle-active');
            });
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