<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Research;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    /**
     * Home page
     */
    public function index(Request $request): Response
    {
        // Get top 5 most used categories based on public research count
        $topCategories = Category::query()
            ->withCount(['researches' => function ($query) {
                $query->where('is_public', true)
                    ->where('status', 'published');
            }])
            ->having('researches_count', '>', 0)
            ->orderByDesc('researches_count')
            ->limit(5)
            ->get()
            ->map(function (Category $category) {
                return [
                    'id' => $category->id,
                    'name_en' => $category->name_en,
                    'name_ar' => $category->name_ar,
                    'slug' => $category->slug,
                    'researches_count' => $category->researches_count,
                ];
            })
            ->values();

        $topResearchers = User::query()
            ->with('researcherProfile')
            ->withCount(['researches' => function ($query) {
                $query->where('is_public', true)
                    ->where('status', 'published');
            }])
            ->whereHas('researches', function ($query) {
                $query->where('is_public', true)
                    ->where('status', 'published');
            })
            ->orderByDesc('researches_count')
            ->limit(4)
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'institution' => optional($user->researcherProfile)->institution,
                    'field' => optional($user->researcherProfile)->headline,
                    'papers' => $user->researches_count,
                    'profile_image' => $user->researcherProfile && $user->researcherProfile->profile_image
                        ? Storage::disk('public')->url($user->researcherProfile->profile_image)
                        : null,
                ];
            })
            ->values();

        $recentResearches = Research::query()
            ->with(['categories', 'researcher'])
            ->where('is_public', true)
            ->where('status', 'published')
            ->latest()
            ->limit(6)
            ->get()
            ->map(function (Research $research) {
                return [
                    'id' => $research->id,
                    'title' => $research->title,
                    'author' => optional($research->researcher)->name,
                    'category' => optional($research->categories->first())->name_en,
                    'category_id' => optional($research->categories->first())->id,
                    'created_at' => $research->created_at,
                ];
            })
            ->values();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'topCategories' => $topCategories,
            'topResearchers' => $topResearchers,
            'recentResearches' => $recentResearches,
        ]);
    }

    /**
     * Browse all public researches
     */
    public function researches(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'category' => $request->string('category')->toString(),
            'year' => $request->string('year')->toString(),
            'sort' => $request->string('sort', 'latest')->toString(),
        ];

        $query = Research::query()
            ->with(['researcher.researcherProfile', 'categories', 'tags', 'wallpaperFile'])
            ->where('is_public', true)
            ->where('status', 'published');

        // Search filter
        if ($filters['search']) {
            $query->where(function ($q) use ($filters) {
                $q->where('title_en', 'like', "%{$filters['search']}%")
                    ->orWhere('title_ar', 'like', "%{$filters['search']}%")
                    ->orWhere('abstract_en', 'like', "%{$filters['search']}%")
                    ->orWhere('abstract_ar', 'like', "%{$filters['search']}%")
                    ->orWhere('keywords_en', 'like', "%{$filters['search']}%")
                    ->orWhere('keywords_ar', 'like', "%{$filters['search']}%");
            });
        }

        // Category filter
        if ($filters['category']) {
            $query->whereHas('categories', function ($q) use ($filters) {
                $q->where('categories.id', $filters['category']);
            });
        }

        // Year filter
        if ($filters['year']) {
            $query->whereYear('published_at', $filters['year']);
        }

        // Sorting
        match ($filters['sort']) {
            'oldest' => $query->oldest('published_at'),
            'title_asc' => $query->orderBy('title_en'),
            'title_desc' => $query->orderByDesc('title_en'),
            default => $query->latest('published_at'),
        };

        $researches = $query->paginate(12)
            ->withQueryString()
            ->through(function (Research $research) {
                return [
                    'id' => $research->id,
                    'title' => $research->title,
                    'abstract' => $research->abstract,
                    'author' => [
                        'id' => $research->researcher->id,
                        'name' => $research->researcher->name,
                        'institution' => optional($research->researcher->researcherProfile)->institution,
                    ],
                    'categories' => $research->categories->map(fn ($cat) => [
                        'id' => $cat->id,
                        'name_en' => $cat->name_en,
                        'name_ar' => $cat->name_ar,
                    ]),
                    'tags' => $research->tags->map(fn ($tag) => [
                        'id' => $tag->id,
                        'name_en' => $tag->name_en,
                        'name_ar' => $tag->name_ar,
                    ]),
                    'wallpaper_url' => $research->wallpaperFile
                        ? Storage::disk('public')->url($research->wallpaperFile->storage_path)
                        : null,
                    'published_at' => $research->published_at?->toDateString(),
                    'year' => $research->year,
                ];
            });

        // Get all categories for filter
        $categories = Category::select('id', 'name_en', 'name_ar')
            ->orderBy('name_en')
            ->get();

        // Get available years
        $years = Research::query()
            ->where('is_public', true)
            ->where('status', 'published')
            ->whereNotNull('year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year');

        return Inertia::render('public/researches/index', [
            'researches' => $researches,
            'categories' => $categories,
            'years' => $years,
            'filters' => $filters,
        ]);
    }

    /**
     * View single research
     */
    public function showResearch(Research $research): Response
    {
        // Only show public, published researches
        abort_if(! $research->is_public || $research->status !== 'published', 404);

        $research->load([
            'researcher.researcherProfile',
            'categories',
            'tags',
            'files' => function ($query) {
                $query->where('is_visible', true);
            },
            'wallpaperFile',
            'primaryFile',
        ]);

        return Inertia::render('public/researches/show', [
            'research' => [
                'id' => $research->id,
                'title_en' => $research->title_en,
                'title_ar' => $research->title_ar,
                'title' => $research->title,
                'abstract_en' => $research->abstract_en,
                'abstract_ar' => $research->abstract_ar,
                'abstract' => $research->abstract,
                'keywords_en' => $research->keywords_en,
                'keywords_ar' => $research->keywords_ar,
                'keywords' => $research->keywords,
                'doi' => $research->doi,
                'journal_name' => $research->journal_name,
                'year' => $research->year,
                'published_at' => $research->published_at?->toDateString(),
                'author' => [
                    'id' => $research->researcher->id,
                    'name' => $research->researcher->name,
                    'email' => $research->researcher->email,
                    'institution' => optional($research->researcher->researcherProfile)->institution,
                    'headline' => optional($research->researcher->researcherProfile)->headline,
                    'bio' => optional($research->researcher->researcherProfile)->bio,
                ],
                'categories' => $research->categories->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name_en' => $cat->name_en,
                    'name_ar' => $cat->name_ar,
                ]),
                'tags' => $research->tags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'name_en' => $tag->name_en,
                    'name_ar' => $tag->name_ar,
                ]),
                'files' => $research->files->map(fn ($file) => [
                    'id' => $file->id,
                    'name' => $file->original_name,
                    'type' => $file->type,
                    'size_bytes' => $file->size_bytes,
                    'mime_type' => $file->mime_type,
                    'url' => Storage::disk('public')->url($file->storage_path),
                    'is_primary' => (bool) $file->is_primary_doc,
                ]),
                'wallpaper_url' => $research->wallpaperFile
                    ? Storage::disk('public')->url($research->wallpaperFile->storage_path)
                    : null,
            ],
        ]);
    }

    /**
     * Browse all researchers
     */
    public function researchers(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'field' => $request->string('field')->toString(),
        ];

        $query = User::query()
            ->with('researcherProfile')
            ->withCount(['researches' => function ($q) {
                $q->where('is_public', true)
                    ->where('status', 'published');
            }])
            ->whereHas('researches', function ($q) {
                $q->where('is_public', true)
                    ->where('status', 'published');
            });

        // Search filter (by basic user fields only)
        if ($filters['search']) {
            $search = $filters['search'];

            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Field filter currently disabled (no matching columns on profile table)

        $researchers = $query->orderByDesc('researches_count')
            ->paginate(12)
            ->withQueryString()
            ->through(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'institution' => optional($user->researcherProfile)->institution,
                    'headline' => optional($user->researcherProfile)->headline,
                    'bio' => optional($user->researcherProfile)->bio,
                    'papers_count' => $user->researches_count,
                ];
            });

        return Inertia::render('public/researchers/index', [
            'researchers' => $researchers,
            'filters' => $filters,
        ]);
    }

    /**
     * View researcher profile
     */
    public function showResearcher(User $researcher): Response
    {

        $researcher->load([
            'researcherProfile.experiences',
            'researcherProfile.educations',
            'researcherProfile.majors',
        ]);
        // dd($researcher);
        // Get researcher's public researches
        $researches = Research::query()
            ->with(['categories', 'tags', 'wallpaperFile'])
            ->where('researcher_id', $researcher->id)
            ->where('is_public', true)
            ->where('status', 'published')
            ->latest('published_at')
            ->get()
            ->map(function (Research $research) {
                return [
                    'id' => $research->id,
                    'title' => $research->title,
                    'abstract' => $research->abstract,
                    'categories' => $research->categories->map(fn ($cat) => [
                        'id' => $cat->id,
                        'name_en' => $cat->name_en,
                        'name_ar' => $cat->name_ar,
                    ]),
                    'tags' => $research->tags->map(fn ($tag) => [
                        'id' => $tag->id,
                        'name_en' => $tag->name_en,
                        'name_ar' => $tag->name_ar,
                    ]),
                    'wallpaper_url' => $research->wallpaperFile
                        ? Storage::disk('public')->url($research->wallpaperFile->storage_path)
                        : null,
                    'published_at' => $research->published_at?->toDateString(),
                    'year' => $research->year,
                ];
            });

        // dd($researches);
        return Inertia::render('public/researchers/show', [
            'researcher' => [
                'id' => $researcher->id,
                'name' => $researcher->name,
                'email' => $researcher->email,
                'profile' => $researcher->researcherProfile ? [
                    'institution' => $researcher->researcherProfile->institution,
                    'headline' => $researcher->researcherProfile->headline,
                    'bio' => $researcher->researcherProfile->bio,
                    'profile_image' => $researcher->researcherProfile->profile_image
                        ? Storage::disk('public')->url($researcher->researcherProfile->profile_image)
                        : null,
                    'website' => $researcher->researcherProfile->website,
                    'phone' => $researcher->researcherProfile->phone,
                    'address' => $researcher->researcherProfile->address,
                    'orcid' => $researcher->researcherProfile->orcid,
                    'google_scholar' => $researcher->researcherProfile->google_scholar,
                    'linkedin_url' => $researcher->researcherProfile->linkedin_url,
                    'github_url' => $researcher->researcherProfile->github_url,
                    'twitter' => $researcher->researcherProfile->twitter,
                    'experiences' => $researcher->researcherProfile->experiences->sortByDesc('is_current')->values()->map(fn ($exp) => [
                        'id' => $exp->id,
                        'title' => $exp->title,
                        'company' => $exp->company,
                        'location' => $exp->location,
                        'start_date' => $exp->start_date?->toDateString(),
                        'end_date' => $exp->end_date?->toDateString(),
                        'is_current' => $exp->is_current,
                        'description' => $exp->description,
                    ]),
                    'educations' => $researcher->researcherProfile->educations->sortByDesc('start_date')->values()->map(fn ($edu) => [
                        'id' => $edu->id,
                        'degree' => $edu->degree,
                        'field' => $edu->field_of_study,
                        'institution' => $edu->institution,
                        'location' => $edu->location,
                        'start_date' => $edu->start_date?->toDateString(),
                        'end_date' => $edu->end_date?->toDateString(),
                        'description' => $edu->description,
                    ]),
                    'majors' => $researcher->researcherProfile->majors->map(fn ($major) => [
                        'id' => $major->id,
                        'name' => $major->name,
                    ]),
                ] : null,
            ],
            'researches' => $researches,
        ]);
    }

    /**
     * Contact page
     */
    public function contact(): Response
    {
        return Inertia::render('public/contact');
    }

    /**
     * Handle contact form submission
     */
    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        return back()->with('success', 'Thank you for contacting us. We will get back to you soon.');
    }
}
