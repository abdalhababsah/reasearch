<?php

namespace App\Http\Controllers\Researcher;

use App\Http\Controllers\Controller;
use App\Models\ResearcherImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ResearcherImageController extends Controller
{
    /**
     * Display a listing of researcher's images
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $query = ResearcherImage::query()
            ->withCount('annotations')
            ->forUser($user->id);

        // Filters
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $perPage = (int) $request->get('per_page', 12);
        $images = $query->paginate($perPage)->withQueryString();

        $imagesData = $images->getCollection()->map(function (ResearcherImage $image) {
            return [
                'id' => $image->id,
                'title' => $image->title,
                'original_filename' => $image->original_filename,
                'url' => $image->url,
                'thumbnail_url' => $image->url, // You can add thumbnail generation later
                'width' => $image->width,
                'height' => $image->height,
                'dimensions' => $image->dimensions,
                'formatted_file_size' => $image->formatted_file_size,
                'file_size_bytes' => $image->file_size_bytes,
                'status' => $image->status,
                'total_annotations' => $image->annotations_count ?? $image->annotations()->count(),
                'created_at' => $image->created_at?->toDateTimeString(),
            ];
        });

        return Inertia::render('researcher/images/Index', [
            'images' => [
                'data' => $imagesData,
                'links' => $images->linkCollection(),
                'meta' => [
                    'current_page' => $images->currentPage(),
                    'last_page' => $images->lastPage(),
                    'per_page' => $images->perPage(),
                    'total' => $images->total(),
                ],
            ],
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'sort' => $sortField,
                'direction' => $sortDirection,
                'per_page' => $perPage,
            ],
            'statistics' => [
                'total' => ResearcherImage::forUser($user->id)->count(),
                'draft' => ResearcherImage::forUser($user->id)->draft()->count(),
                'labeled' => ResearcherImage::forUser($user->id)->labeled()->count(),
            ],
        ]);
    }

    /**
     * Show a single image
     */
    public function show(Request $request, ResearcherImage $image): Response
    {
        if ($image->user_id !== $request->user()->id) {
            abort(404);
        }

        $image->loadCount('annotations');

        return Inertia::render('researcher/images/Show', [
            'image' => [
                'id' => $image->id,
                'title' => $image->title,
                'description' => $image->description,
                'original_filename' => $image->original_filename,
                'url' => $image->url,
                'width' => $image->width,
                'height' => $image->height,
                'dimensions' => $image->dimensions,
                'file_size_bytes' => $image->file_size_bytes,
                'formatted_file_size' => $image->formatted_file_size,
                'mime_type' => $image->mime_type,
                'status' => $image->status,
                'total_annotations' => $image->annotations_count,
                'uploaded_at' => $image->uploaded_at?->toDateTimeString(),
                'created_at' => $image->created_at?->toDateTimeString(),
                'updated_at' => $image->updated_at?->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Store newly uploaded images
     */
    public function store(Request $request)
    {
        $request->validate([
            'image_files'   => 'required|array',
            'image_files.*' => 'file|mimes:jpg,jpeg,png,gif,webp|max:10240', // 10MB each
            'title'         => 'nullable|string|max:255',
            'description'   => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $userId = $request->user()->id;
            $files = $request->file('image_files', []);

            $storedPaths = [];
            $createdCount = 0;

            foreach ($files as $file) {
                if (!$file) {
                    continue;
                }

                $originalFilename = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();

                // Generate unique stored filename
                $storedFilename = Str::random(40) . '.' . $extension;

                // Store in storage/app/public/researcher-images/{user_id}/
                $storagePath = $file->storeAs(
                    "researcher-images/{$userId}",
                    $storedFilename,
                    'public'
                );

                $storedPaths[] = $storagePath;

                // Get image dimensions
                $imagePath = Storage::disk('public')->path($storagePath);
                $imageInfo = $this->extractImageMetadata($imagePath);

                // Create image record
                ResearcherImage::create([
                    'user_id'          => $userId,
                    'original_filename'=> $originalFilename,
                    'stored_filename'  => $storedFilename,
                    'storage_path'     => $storagePath,
                    'mime_type'        => $file->getMimeType(),
                    'file_size_bytes'  => $file->getSize(),
                    'width'            => $imageInfo['width'] ?? null,
                    'height'           => $imageInfo['height'] ?? null,
                    'title'            => $request->filled('title')
                        ? $request->title
                        : pathinfo($originalFilename, PATHINFO_FILENAME),
                    'description'      => $request->description,
                    'status'           => 'draft',
                    'uploaded_at'      => now(),
                ]);

                $createdCount++;
            }

            DB::commit();

            return back()->with(
                'success',
                $createdCount . ' image' . ($createdCount === 1 ? '' : 's') . ' uploaded successfully!'
            );

        } catch (\Throwable $e) {
            DB::rollBack();

            // Clean up any files that were stored
            foreach ($storedPaths as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            return back()->with('error', 'Failed to upload images: ' . $e->getMessage());
        }
    }

    /**
     * Update image metadata
     */
    public function update(Request $request, ResearcherImage $image)
    {
        // Authorization
        if ($image->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $image->update($request->only(['title', 'description']));

        return back()->with('success', 'Image updated successfully!');
    }

    /**
     * Delete image
     */
    public function destroy(Request $request, ResearcherImage $image)
    {
        // Authorization
        if ($image->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        try {
            DB::beginTransaction();

            // Delete physical file
            if (Storage::disk('public')->exists($image->storage_path)) {
                Storage::disk('public')->delete($image->storage_path);
            }

            // Soft delete image (cascades to annotations and labels)
            $image->delete();

            DB::commit();

            return back()->with('success', 'Image deleted successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete image: ' . $e->getMessage());
        }
    }

    /**
     * Extract image metadata
     */
    private function extractImageMetadata(string $filePath): array
    {
        try {
            $imageSize = getimagesize($filePath);
            
            return [
                'width' => $imageSize[0] ?? null,
                'height' => $imageSize[1] ?? null,
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to extract image metadata', [
                'error' => $e->getMessage(),
                'file' => $filePath,
            ]);

            return [
                'width' => null,
                'height' => null,
            ];
        }
    }
}