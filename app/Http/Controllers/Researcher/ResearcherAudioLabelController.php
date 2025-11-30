<?php

namespace App\Http\Controllers\Researcher;

use App\Http\Controllers\Controller;
use App\Models\ResearcherAudioLabel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ResearcherAudioLabelController extends Controller
{
    /**
     * Get all labels for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $labels = ResearcherAudioLabel::forUser($request->user()->id)
            ->withCount('segments')
            ->orderBy('name')
            ->get();

        return response()->json($labels);
    }

    /**
     * Create a new label
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($request) {
                    $exists = ResearcherAudioLabel::where('user_id', $request->user()->id)
                        ->where('name', $value)
                        ->exists();

                    if ($exists) {
                        $fail('A label with this name already exists.');
                    }
                },
            ],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'description' => 'nullable|string|max:500',
        ]);

        $label = ResearcherAudioLabel::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'color' => $request->color,
            'description' => $request->description,
        ]);

        // If this is a pure API request (no Inertia), return JSON
        if (!$request->header('X-Inertia') && ($request->expectsJson() || $request->wantsJson())) {
            return response()->json(['label' => $label], 201);
        }

        // Inertia / normal web flow: redirect back with flash
        return back()->with([
            'success' => 'Label created successfully!',
            'label'   => $label,
        ]);
    }

    /**
     * Update an existing label
     */
    public function update(Request $request, ResearcherAudioLabel $label): JsonResponse
    {
        // Authorization
        if ($label->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($request, $label) {
                    $exists = ResearcherAudioLabel::where('user_id', $request->user()->id)
                        ->where('name', $value)
                        ->where('id', '!=', $label->id)
                        ->exists();

                    if ($exists) {
                        $fail('A label with this name already exists.');
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
    public function destroy(Request $request, ResearcherAudioLabel $label): JsonResponse
    {
        // Authorization
        if ($label->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        // Check if label is in use
        if ($label->isInUse()) {
            return response()->json([
                'error' => 'Cannot delete label that is currently in use by segments.',
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
    public function toggleActive(Request $request, ResearcherAudioLabel $label): JsonResponse
    {
        // Authorization
        if ($label->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $label->is_active = !$label->is_active;
        $label->save();

        return response()->json($label);
    }
}
