<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\File;
use App\Models\Research;
use App\Models\ResearchVersion;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the main dashboard and redirect based on user role.
     */
    public function index(): Response|\Illuminate\Http\RedirectResponse
    {
        $user = auth()->user();
        $user->load('role', 'researcherProfile');
        
        // Redirect based on role
        if ($user->role) {
            if ($user->role->name === 'admin') {
                return redirect()->route('admin.dashboard');
            } elseif ($user->role->name === 'researcher') {
                return redirect()->route('researcher.dashboard');
            }
        }
        
        // Fallback to default dashboard
        return Inertia::render('dashboard');
    }

    /**
     * Display the admin dashboard.
     */
    public function admin(): Response
    {
        $researchStatusCounts = Research::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $visibilityCounts = Research::selectRaw('is_public, COUNT(*) as total')
            ->groupBy('is_public')
            ->pluck('total', 'is_public');

        $fileTypeCounts = File::selectRaw("COALESCE(type, 'other') as type, COUNT(*) as total")
            ->groupBy('type')
            ->pluck('total', 'type');

        $latestResearches = Research::with('researcher')
            ->latest('created_at')
            ->take(6)
            ->get()
            ->map(fn (Research $research) => [
                'id' => $research->id,
                'title' => $research->title,
                'status' => $research->status,
                'is_public' => $research->is_public,
                'created_at' => $research->created_at?->toDateTimeString(),
                'author' => $research->researcher ? [
                    'id' => $research->researcher->id,
                    'name' => $research->researcher->name,
                    'email' => $research->researcher->email,
                ] : null,
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totals' => [
                    'researches' => Research::count(),
                    'researchVersions' => ResearchVersion::count(),
                    'files' => File::count(),
                    'categories' => Category::count(),
                    'tags' => Tag::count(),
                    'researchers' => User::whereHas('role', fn ($query) => $query->where('name', 'researcher'))->count(),
                    'admins' => User::whereHas('role', fn ($query) => $query->where('name', 'admin'))->count(),
                    'publicResearches' => (int) ($visibilityCounts[1] ?? $visibilityCounts['1'] ?? 0),
                    'privateResearches' => (int) ($visibilityCounts[0] ?? $visibilityCounts['0'] ?? 0),
                ],
                'statusCounts' => [
                    'draft' => (int) ($researchStatusCounts['draft'] ?? 0),
                    'under_review' => (int) ($researchStatusCounts['under_review'] ?? 0),
                    'published' => (int) ($researchStatusCounts['published'] ?? 0),
                    'archived' => (int) ($researchStatusCounts['archived'] ?? 0),
                ],
                'fileTypes' => [
                    'document' => (int) ($fileTypeCounts['document'] ?? 0),
                    'dataset' => (int) ($fileTypeCounts['dataset'] ?? 0),
                    'image' => (int) ($fileTypeCounts['image'] ?? 0),
                    'other' => (int) ($fileTypeCounts['other'] ?? 0),
                ],
                'latestResearches' => $latestResearches,
            ],
        ]);
    }

    /**
     * Display the researcher dashboard.
     */
    public function researcher(Request $request): Response
    {
        $user = $request->user();
        $user->load('researcherProfile');
        $profile = $user->researcherProfile;

        $profileIncomplete = !$profile || !$profile->bio;

        $researchIds = Research::where('researcher_id', $user->id)->pluck('id');

        $researchStatusCounts = Research::where('researcher_id', $user->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $visibilityCounts = Research::where('researcher_id', $user->id)
            ->selectRaw('is_public, COUNT(*) as total')
            ->groupBy('is_public')
            ->pluck('total', 'is_public');

        $fileTypeCounts = File::whereIn('research_id', $researchIds)
            ->selectRaw("COALESCE(type, 'other') as type, COUNT(*) as total")
            ->groupBy('type')
            ->pluck('total', 'type');

        $latestResearches = Research::where('researcher_id', $user->id)
            ->latest('updated_at')
            ->take(6)
            ->get()
            ->map(fn (Research $research) => [
                'id' => $research->id,
                'title' => $research->title,
                'status' => $research->status,
                'is_public' => $research->is_public,
                'updated_at' => $research->updated_at?->toDateTimeString(),
            ]);

        return Inertia::render('researcher/dashboard', [
            'profileIncomplete' => $profileIncomplete,
            'stats' => [
                'totals' => [
                    'researches' => $researchIds->count(),
                    'researchVersions' => ResearchVersion::whereIn('research_id', $researchIds)->count(),
                    'files' => File::whereIn('research_id', $researchIds)->count(),
                    'publicResearches' => (int) ($visibilityCounts[1] ?? $visibilityCounts['1'] ?? 0),
                    'privateResearches' => (int) ($visibilityCounts[0] ?? $visibilityCounts['0'] ?? 0),
                ],
                'statusCounts' => [
                    'draft' => (int) ($researchStatusCounts['draft'] ?? 0),
                    'under_review' => (int) ($researchStatusCounts['under_review'] ?? 0),
                    'published' => (int) ($researchStatusCounts['published'] ?? 0),
                    'archived' => (int) ($researchStatusCounts['archived'] ?? 0),
                ],
                'fileTypes' => [
                    'document' => (int) ($fileTypeCounts['document'] ?? 0),
                    'dataset' => (int) ($fileTypeCounts['dataset'] ?? 0),
                    'image' => (int) ($fileTypeCounts['image'] ?? 0),
                    'other' => (int) ($fileTypeCounts['other'] ?? 0),
                ],
                'latestResearches' => $latestResearches,
            ],
        ]);
    }
}
