<?php

namespace App\Http\Controllers\Researcher;

use App\Http\Controllers\Controller;
use App\Models\ResearcherImage;
use App\Models\ResearcherImageAnnotation;
use App\Models\ResearcherImageLabel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class ResearcherImageAnnotationController extends Controller
{
    /**
     * Show the annotation interface for an image
     */
    public function edit(Request $request, ResearcherImage $image): Response
    {
        // Authorization
        if ($image->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        // Load image with annotations and their labels
        $image->load('annotations.label');

        // Get active labels for this specific image
        $labels = ResearcherImageLabel::active()
            ->forImage($image->id)
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'description']);

        return Inertia::render('researcher/images/Annotate', [
            'image' => [
                'id' => $image->id,
                'title' => $image->title,
                'description' => $image->description,
                'original_filename' => $image->original_filename,
                'url' => $image->url,
                'width' => $image->width,
                'height' => $image->height,
                'status' => $image->status,
                'annotations' => $image->annotations->map(fn($annotation) => [
                    'id' => $annotation->id,
                    'label_id' => $annotation->label_id,
                    'x' => $annotation->x,
                    'y' => $annotation->y,
                    'width' => $annotation->width,
                    'height' => $annotation->height,
                    'notes' => $annotation->notes,
                    'label' => $annotation->label ? [
                        'id' => $annotation->label->id,
                        'name' => $annotation->label->name,
                        'color' => $annotation->label->color,
                    ] : null,
                ]),
            ],
            'labels' => $labels,
        ]);
    }

    /**
     * Save annotations for an image
     */
    public function update(Request $request, ResearcherImage $image)
    {
        // Authorization
        if ($image->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'annotations' => 'required|array',
            'annotations.*.label_id' => 'required|exists:researcher_image_labels,id',
            'annotations.*.x' => 'required|numeric|min:0',
            'annotations.*.y' => 'required|numeric|min:0',
            'annotations.*.width' => 'required|numeric|min:1',
            'annotations.*.height' => 'required|numeric|min:1',
            'annotations.*.notes' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Delete all existing annotations
            $image->annotations()->delete();

            // Create new annotations
            foreach ($request->annotations as $annotationData) {
                ResearcherImageAnnotation::create([
                    'researcher_image_id' => $image->id,
                    'label_id' => $annotationData['label_id'],
                    'x' => $annotationData['x'],
                    'y' => $annotationData['y'],
                    'width' => $annotationData['width'],
                    'height' => $annotationData['height'],
                    'notes' => $annotationData['notes'] ?? null,
                ]);
            }

            // Mark image as labeled if annotations exist
            if (count($request->annotations) > 0) {
                $image->markAsLabeled();
            }

            DB::commit();

            return back()->with('success', 'Annotations saved successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to save annotations: ' . $e->getMessage());
        }
    }

    /**
     * Export annotations as JSON
     */
    public function export(Request $request, ResearcherImage $image)
    {
        // Authorization
        if ($image->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        // Mark as exported
        $image->markAsExported();

        // Generate JSON
        $jsonData = $image->exportToJson();

        // Create filename
        $filename = Str::slug($image->title ?: $image->original_filename) . '_annotations.json';

        return response()->json($jsonData, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Get annotations for an image (AJAX)
     */
    public function index(Request $request, ResearcherImage $image)
    {
        // Authorization
        if ($image->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $annotations = $image->annotations()
            ->with('label')
            ->get()
            ->map(fn($annotation) => [
                'id' => $annotation->id,
                'x' => $annotation->x,
                'y' => $annotation->y,
                'width' => $annotation->width,
                'height' => $annotation->height,
                'label' => [
                    'id' => $annotation->label->id,
                    'name' => $annotation->label->name,
                    'color' => $annotation->label->color,
                ],
                'notes' => $annotation->notes,
            ]);

        return response()->json($annotations);
    }
}