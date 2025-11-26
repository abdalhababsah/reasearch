<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TagRequest;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $locale = app()->getLocale() === 'ar' ? 'ar' : 'en';
        $nameColumn = "name_{$locale}";

        $tags = Tag::latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Tag $tag) => [
                'id' => $tag->id,
                'name' => $tag->{$nameColumn},
                'name_en' => $tag->name_en,
                'name_ar' => $tag->name_ar,
                'slug' => $tag->slug,
                'created_at' => $tag->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('admin/tags/index', [
            'tags' => $tags,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('admin.tags.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TagRequest $request): RedirectResponse
    {
        Tag::create($this->formatData($request));

        return redirect()
            ->route('admin.tags.index')
            ->with('success', 'Tag created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag): Response
    {
        $localeName = "name_" . (app()->getLocale() === 'ar' ? 'ar' : 'en');

        return Inertia::render('admin/tags/show', [
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->{$localeName},
                'name_en' => $tag->name_en,
                'name_ar' => $tag->name_ar,
                'slug' => $tag->slug,
                'created_at' => $tag->created_at?->toDateTimeString(),
                'updated_at' => $tag->updated_at?->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tag $tag): RedirectResponse
    {
        return redirect()->route('admin.tags.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TagRequest $request, Tag $tag): RedirectResponse
    {
        $tag->update($this->formatData($request));

        return redirect()
            ->route('admin.tags.index')
            ->with('success', 'Tag updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag): RedirectResponse
    {
        try {
            $tag->delete();

            return redirect()
                ->route('admin.tags.index')
                ->with('success', 'Tag deleted successfully.');
        } catch (\Throwable $exception) {
            Log::error('Unable to delete tag', [
                'tag_id' => $tag->id,
                'message' => $exception->getMessage(),
            ]);

            return back()->with('error', 'Unable to delete tag at this time.');
        }
    }

    /**
     * Prepare the validated data for persistence.
     */
    protected function formatData(TagRequest $request): array
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['slug']);

        return $data;
    }
}
