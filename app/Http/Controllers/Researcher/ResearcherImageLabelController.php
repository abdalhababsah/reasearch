<?php

namespace App\Http\Controllers\Researcher;

use App\Http\Controllers\Controller;
use App\Models\ResearcherImage;
use App\Models\ResearcherImageLabel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ResearcherImageLabelController extends Controller
{
    /**
     * Get all labels for a specific image
     */
    public function index(Request $request, ResearcherImage $image): JsonResponse
    {
        // Authorization
        if ($image->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $labels = ResearcherImageLabel::forImage($image->id)
            ->withCount('annotations')
            ->orderBy('name')
            ->get();

        return response()->json($labels);
    }

    /**
     * Create a new label for a specific image
     */
    public function store(Request $request, ResearcherImage $image)
    {
        // Authorization
        if ($image->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($image) {
                    $exists = ResearcherImageLabel::where('researcher_image_id', $image->id)
                        ->where('name', $value)
                        ->exists();

                    if ($exists) {
                        $fail('A label with this name already exists for this image.');
                    }
                },
            ],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'description' => 'nullable|string|max:500',
        ]);

        $label = ResearcherImageLabel::create([
            'researcher_image_id' => $image->id,
            'name' => $request->name,
            'color' => $request->color,
            'description' => $request->description,
        ]);

        // Return for Inertia
        return back()->with([
            'success' => 'Label created successfully!',
            'label'   => $label,
        ]);
    }

    /**
     * Update an existing label
     */
    public function update(Request $request, ResearcherImage $image, ResearcherImageLabel $label): JsonResponse
    {
        // Authorization
        if ($image->user_id !== $request->user()->id || $label->researcher_image_id !== $image->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($image, $label) {
                    $exists = ResearcherImageLabel::where('researcher_image_id', $image->id)
                        ->where('name', $value)
                        ->where('id', '!=', $label->id)
                        ->exists();

                    if ($exists) {
                        $fail('A label with this name already exists for this image.');
                    }
                },
            ],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'description' => 'nullable|string|max:500',
        ]);

        $label->update($request->only(['name', 'color', 'description']));

        return response()->json($label);
    }

    /**
     * Delete a label
     */
    public function destroy(Request $request, ResearcherImage $image, ResearcherImageLabel $label): JsonResponse
    {
        // Authorization
        if ($image->user_id !== $request->user()->id || $label->researcher_image_id !== $image->id) {
            abort(403, 'Unauthorized');
        }

        // Check if label is in use
        if ($label->isInUse()) {
            return response()->json([
                'error' => 'Cannot delete label that is currently in use by annotations.',
            ], 422);
        }

        $label->delete();

        return response()->json([
            'message' => 'Label deleted successfully!',
        ]);
    }

    /**
     * Toggle active status of a label
     */
    public function toggleActive(Request $request, ResearcherImage $image, ResearcherImageLabel $label): JsonResponse
    {
        // Authorization
        if ($image->user_id !== $request->user()->id || $label->researcher_image_id !== $image->id) {
            abort(403, 'Unauthorized');
        }

        $label->is_active = !$label->is_active;
        $label->save();

        return response()->json($label);
    }
}