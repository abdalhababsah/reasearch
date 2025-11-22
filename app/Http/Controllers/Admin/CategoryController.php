<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $categories = Category::with('parent:id,name')
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'parent_id' => $category->parent_id,
                'parent' => $category->parent ? [
                    'id' => $category->parent->id,
                    'name' => $category->parent->name,
                ] : null,
                'created_at' => $category->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'parents' => $this->parentOptions(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('admin.categories.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryRequest $request): RedirectResponse
    {
        Category::create($this->formatData($request));

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category): Response
    {
        $category->load(['parent:id,name', 'children:id,name,parent_id']);

        return Inertia::render('admin/categories/show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'parent' => $category->parent ? [
                    'id' => $category->parent->id,
                    'name' => $category->parent->name,
                ] : null,
                'children' => $category->children->map(fn (Category $child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                ])->values(),
                'created_at' => $category->created_at?->toDateTimeString(),
                'updated_at' => $category->updated_at?->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category): RedirectResponse
    {
        return redirect()->route('admin.categories.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($this->formatData($request));

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        try {
            $category->delete();

            return redirect()
                ->route('admin.categories.index')
                ->with('success', 'Category deleted successfully.');
        } catch (\Throwable $exception) {
            Log::error('Unable to delete category', [
                'category_id' => $category->id,
                'message' => $exception->getMessage(),
            ]);

            return back()->with('error', 'Unable to delete category at this time.');
        }
    }

    /**
     * Format the incoming request data.
     */
    protected function formatData(CategoryRequest $request): array
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['slug']);
        $data['parent_id'] = $data['parent_id'] ?: null;

        return $data;
    }

    /**
     * Get parent category options.
     */
    protected function parentOptions(?int $excludingId = null)
    {
        return Category::when($excludingId, fn ($query) => $query->where('id', '!=', $excludingId))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->values();
    }
}
