<?php

namespace App\Http\Controllers\Researcher;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResearchRequest;
use App\Models\Category;
use App\Models\File;
use App\Models\Research;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ResearchController extends Controller
{
    protected array $statuses = ['draft', 'under_review', 'published', 'archived'];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'visibility' => $request->string('visibility')->toString(),
        ];

        $query = Research::where('researcher_id', $user->id);

        if ($filters['search']) {
            $query->where(function ($builder) use ($filters) {
                $builder->where('title_en', 'like', "%{$filters['search']}%")
                    ->orWhere('title_ar', 'like', "%{$filters['search']}%");
            });
        }

        if ($filters['status']) {
            $query->where('status', $filters['status']);
        }

        if ($filters['visibility']) {
            if ($filters['visibility'] === 'public') {
                $query->where('is_public', true);
            } elseif ($filters['visibility'] === 'private') {
                $query->where('is_public', false);
            }
        }

        $researches = $query->latest('created_at')
            ->paginate(9)
            ->withQueryString()
            ->through(fn (Research $research) => [
                'id' => $research->id,
                'title' => $research->title,
                'status' => $research->status,
                'is_public' => $research->is_public,
                'created_at' => $research->created_at?->toDateTimeString(),
                'excerpt' => Str::limit($research->abstract, 120),
            ]);

        return Inertia::render('researcher/researches/index', [
            'researches' => $researches,
            'filters' => $filters,
            'statuses' => $this->statusOptions(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('researcher/researches/create', [
            'statuses' => $this->statusOptions(),
            'categories' => Category::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get(),
            'tags' => Tag::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ResearchRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $this->prepareData($request);
        $data['researcher_id'] = $user->id;

        $research = Research::create($data);

        // Sync categories & tags
        $categoryIds = $request->input('category_ids', []);
        $tagIds = $request->input('tag_ids', []);

        $research->categories()->sync($categoryIds);
        $research->tags()->sync($tagIds);

        // Handle uploads (documents, wallpaper, and primary selection)
        $this->handleUploads($request, $research);

        return redirect()->route('researcher.researches.index')
            ->with('success', 'Research created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Research $research): Response
    {
        $this->authorizeResearch($request, $research);
        $research->load('files', 'categories', 'tags', 'primaryFile', 'wallpaperFile');

        return Inertia::render('researcher/researches/show', [
            'research' => $this->formatResearch($research, includeBody: true),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Research $research): Response
    {
        $this->authorizeResearch($request, $research);
        $research->load('files', 'categories', 'tags', 'primaryFile', 'wallpaperFile');

        return Inertia::render('researcher/researches/edit', [
            'research' => $this->formatResearch($research, includeBody: true, includeRaw: true),
            'statuses' => $this->statusOptions(),
            'categories' => Category::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get(),
            'tags' => Tag::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get(),
            'selectedCategories' => $research->categories->pluck('id')->toArray(),
            'selectedTags' => $research->tags->pluck('id')->toArray(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ResearchRequest $request, Research $research): RedirectResponse
    {
        $this->authorizeResearch($request, $research);
        $data = $this->prepareData($request);

        $research->update($data);

        // Sync categories & tags
        $categoryIds = $request->input('category_ids', []);
        $tagIds = $request->input('tag_ids', []);

        $research->categories()->sync($categoryIds);
        $research->tags()->sync($tagIds);

        // Handle file removals
        $removeFileIds = $request->input('remove_file_ids', []);
        if (!empty($removeFileIds)) {
            $filesToRemove = File::whereIn('id', $removeFileIds)
                ->where('research_id', $research->id)
                ->get();

            foreach ($filesToRemove as $file) {
                // If removing the primary file, clear the reference
                if ($research->primary_file_id === $file->id) {
                    $research->primary_file_id = null;
                    $research->save();
                }

                Storage::disk('public')->delete($file->storage_path);
                $file->delete();
            }
        }

        // Handle wallpaper removal
        if ($request->boolean('remove_wallpaper')) {
            if ($research->wallpaperFile) {
                Storage::disk('public')->delete($research->wallpaperFile->storage_path);
                $research->wallpaperFile->delete();
                $research->wallpaper_file_id = null;
                $research->save();
            }
        }

        // Handle new uploads
        $this->handleUploads($request, $research);

        return redirect()->route('researcher.researches.show', $research)
            ->with('success', 'Research updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Research $research): RedirectResponse
    {
        $this->authorizeResearch($request, $research);

        // Delete all associated files from storage
        foreach ($research->files as $file) {
            Storage::disk('public')->delete($file->storage_path);
            $file->delete();
        }

        $research->delete();

        return redirect()->route('researcher.researches.index')
            ->with('success', 'Research deleted successfully.');
    }

    /**
     * Prepare validated data for storage.
     */
    protected function prepareData(ResearchRequest $request): array
    {
        $data = $request->validated();
        $data['status'] = $data['status'] ?? 'draft';
        $data['is_public'] = $request->boolean('is_public');

        return $data;
    }

    /**
     * Handle file uploads with proper separation of:
     * - Regular document files (with per-file visibility)
     * - Primary file selection (main research document)
     * - Wallpaper image (cover photo)
     */
    protected function handleUploads(Request $request, Research $research): void
    {
        $primaryIndex = is_null($request->input('primary_file_index'))
            ? null
            : (int) $request->input('primary_file_index');

        $newPrimaryFileId = null;

        // Get file visibility settings (array of booleans)
        $fileVisibility = $request->input('file_visibility', []);

        // 1) Upload regular document files
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $index => $upload) {
                if (!$upload) {
                    continue;
                }

                $path = $upload->store("researches/{$research->id}/documents", 'public');
                $isPrimary = $primaryIndex !== null && $primaryIndex === $index;

                // Determine file type based on mime type
                $mimeType = $upload->getMimeType();
                $fileType = $this->determineFileType($mimeType);

                // Get visibility for this specific file (default: true)
                $isVisible = isset($fileVisibility[$index]) 
                    ? (bool) $fileVisibility[$index] 
                    : true;

                $file = File::create([
                    'research_id' => $research->id,
                    'type' => $fileType,
                    'original_name' => $upload->getClientOriginalName(),
                    'storage_path' => $path,
                    'mime_type' => $mimeType,
                    'size_bytes' => $upload->getSize(),
                    'is_primary_doc' => $isPrimary,
                    'is_downloadable' => true,
                    'is_visible' => $isVisible,
                    'uploaded_by' => $request->user()->id,
                    'uploaded_at' => now(),
                ]);

                // Track the primary file ID
                if ($isPrimary) {
                    $newPrimaryFileId = $file->id;
                }
            }
        }

        // Set primary file ID if a new one was uploaded
        if ($newPrimaryFileId) {
            // First, unmark any existing primary file
            File::where('research_id', $research->id)
                ->where('id', '!=', $newPrimaryFileId)
                ->update(['is_primary_doc' => false]);

            $research->primary_file_id = $newPrimaryFileId;
            $research->save();
        }

        // 2) Handle wallpaper separately (cover image)
        if ($request->hasFile('wallpaper')) {
            // Remove old wallpaper if exists
            if ($research->wallpaperFile) {
                Storage::disk('public')->delete($research->wallpaperFile->storage_path);
                $research->wallpaperFile->delete();
            }

            $wallpaperUpload = $request->file('wallpaper');
            $path = $wallpaperUpload->store("researches/{$research->id}/wallpaper", 'public');

            $file = File::create([
                'research_id' => $research->id,
                'type' => 'image',
                'original_name' => $wallpaperUpload->getClientOriginalName(),
                'storage_path' => $path,
                'mime_type' => $wallpaperUpload->getMimeType(),
                'size_bytes' => $wallpaperUpload->getSize(),
                'is_primary_doc' => false,
                'is_downloadable' => false,
                'is_visible' => false, // Wallpaper is not publicly visible in file list
                'uploaded_by' => $request->user()->id,
                'uploaded_at' => now(),
            ]);

            $research->wallpaper_file_id = $file->id;
            $research->save();
        }
    }

    /**
     * Determine file type based on MIME type.
     */
    protected function determineFileType(string $mimeType): string
    {
        // Dataset file types
        if (in_array($mimeType, [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json',
            'text/xml',
            'application/xml',
        ])) {
            return 'dataset';
        }

        // Image types
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }

        // Default to document (PDF, Word, etc.)
        return 'document';
    }

    /**
     * Ensure the user owns the research.
     */
    protected function authorizeResearch(Request $request, Research $research): void
    {
        abort_if($research->researcher_id !== $request->user()->id, 403);
    }

    /**
     * Format research data for frontend.
     */
    protected function formatResearch(Research $research, bool $includeBody = false, bool $includeRaw = false): array
    {
        $data = [
            'id' => $research->id,
            'title' => $research->title,
            'status' => $research->status,
            'is_public' => $research->is_public,
            'keywords' => $research->keywords,
            'created_at' => $research->created_at?->toDateTimeString(),
            'files' => $research->files->map(fn (File $file) => [
                'id' => $file->id,
                'name' => $file->original_name,
                'size_bytes' => $file->size_bytes,
                'mime_type' => $file->mime_type,
                'type' => $file->type,
                'url' => Storage::disk('public')->url($file->storage_path),
                'is_primary' => (bool) $file->is_primary_doc,
                'is_visible' => (bool) $file->is_visible,
            ]),
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
        ];

        if ($includeBody) {
            $data['title_en'] = $research->title_en;
            $data['title_ar'] = $research->title_ar;
            $data['abstract'] = $research->abstract;
            $data['abstract_en'] = $research->abstract_en;
            $data['abstract_ar'] = $research->abstract_ar;
            $data['keywords_en'] = $research->keywords_en;
            $data['keywords_ar'] = $research->keywords_ar;
        }

        if ($includeRaw) {
            $data['raw'] = [
                'title_en' => $research->title_en,
                'title_ar' => $research->title_ar,
                'abstract_en' => $research->abstract_en,
                'abstract_ar' => $research->abstract_ar,
                'keywords_en' => $research->keywords_en,
                'keywords_ar' => $research->keywords_ar,
                'status' => $research->status,
                'is_public' => $research->is_public,
            ];
        }

        return $data;
    }

    /**
     * Get formatted status options for dropdowns.
     */
    protected function statusOptions(): array
    {
        return collect($this->statuses)
            ->map(fn ($status) => [
                'value' => $status,
                'label' => Str::headline($status),
            ])
            ->all();
    }
}