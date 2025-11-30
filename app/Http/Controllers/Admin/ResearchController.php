<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Research;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ResearchController extends Controller
{
    protected array $statuses = ['draft', 'under_review', 'published', 'archived'];

    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'visibility' => $request->string('visibility')->toString(),
        ];

        $query = Research::with('researcher');

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
            ->through(function (Research $research) {
                return [
                    'id' => $research->id,
                    'title' => $research->title,
                    'status' => $research->status,
                    'is_public' => $research->is_public,
                    'created_at' => $research->created_at?->toDateTimeString(),
                    'excerpt' => $research->abstract ? str($research->abstract)->limit(120) : null,
                    'author' => $research->researcher ? [
                        'id' => $research->researcher->id,
                        'name' => $research->researcher->name,
                        'email' => $research->researcher->email,
                    ] : null,
                ];
            });

        $statuses = collect($this->statuses)->map(fn (string $value) => [
            'value' => $value,
            'label' => $value,
        ]);

        return Inertia::render('admin/researches/index', [
            'researches' => $researches,
            'filters' => $filters,
            'statuses' => $statuses,
        ]);
    }

    public function show(Research $research): Response
    {
        $research->load(['researcher', 'categories', 'tags', 'files', 'wallpaperFile']);

        return Inertia::render('admin/researches/show', [
            'research' => [
                'id' => $research->id,
                'title' => $research->title,
                'title_en' => $research->title_en,
                'title_ar' => $research->title_ar,
                'abstract' => $research->abstract,
                'status' => $research->status,
                'is_public' => $research->is_public,
                'created_at' => $research->created_at?->toDateTimeString(),
                'author' => $research->researcher ? [
                    'id' => $research->researcher->id,
                    'name' => $research->researcher->name,
                    'email' => $research->researcher->email,
                ] : null,
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
                    'is_primary' => (bool) $file->is_primary_doc,
                    'is_visible' => (bool) $file->is_visible,
                    'url' => $file->storage_path
                        ? Storage::disk('public')->url($file->storage_path)
                        : null,
                ]),
            ],
            'statusOptions' => $this->statuses,
        ]);
    }

    public function update(Request $request, Research $research): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:draft,under_review,published,archived'],
            'is_public' => ['required', 'boolean'],
        ]);

        $research->update([
            'status' => $data['status'],
            'is_public' => $data['is_public'],
        ]);

        return redirect()
            ->route('admin.researches.show', $research)
            ->with('success', 'Research visibility and status updated.');
    }
}
