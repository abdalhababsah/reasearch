<?php

namespace App\Http\Controllers\Researcher;

use App\Http\Controllers\Controller;
use App\Models\ResearcherAudio;
use App\Models\ResearcherAudioSegment;
use App\Models\ResearcherAudioLabel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class ResearcherAudioSegmentController extends Controller
{
    /**
     * Show the labeling interface for an audio file
     */
    public function edit(Request $request, ResearcherAudio $audio): Response
    {
        // Authorization
        if ($audio->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        // Load audio with segments and their labels
        $audio->load('segments.label');

        // Get active labels for this specific audio file
        $labels = ResearcherAudioLabel::active()
            ->forAudio($audio->id)
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'description']);

        return Inertia::render('researcher/audios/Label', [
            'audio' => [
                'id' => $audio->id,
                'title' => $audio->title,
                'description' => $audio->description,
                'original_filename' => $audio->original_filename,
                'url' => $audio->url,
                'duration_seconds' => $audio->duration_seconds,
                'status' => $audio->status,
                'segments' => $audio->segments->map(fn($segment) => [
                    'id' => $segment->id,
                    'label_id' => $segment->label_id,
                    'start_time' => $segment->start_time,
                    'end_time' => $segment->end_time,
                    'notes' => $segment->notes,
                    'label' => $segment->label ? [
                        'id' => $segment->label->id,
                        'name' => $segment->label->name,
                        'color' => $segment->label->color,
                    ] : null,
                ]),
            ],
            'labels' => $labels,
        ]);
    }

    /**
     * Save segments for an audio file
     */
    public function update(Request $request, ResearcherAudio $audio)
    {
        // Authorization
        if ($audio->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'segments' => 'required|array',
            'segments.*.label_id' => 'required|exists:researcher_audio_labels,id',
            'segments.*.start_time' => 'required|numeric|min:0',
            'segments.*.end_time' => 'required|numeric|gt:segments.*.start_time',
            'segments.*.notes' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Delete all existing segments
            $audio->segments()->delete();

            // Create new segments
            foreach ($request->segments as $segmentData) {
                ResearcherAudioSegment::create([
                    'researcher_audio_id' => $audio->id,
                    'label_id' => $segmentData['label_id'],
                    'start_time' => $segmentData['start_time'],
                    'end_time' => $segmentData['end_time'],
                    'notes' => $segmentData['notes'] ?? null,
                ]);
            }

            // Mark audio as labeled if segments exist
            if (count($request->segments) > 0) {
                $audio->markAsLabeled();
            }

            DB::commit();

            return back()->with('success', 'Segments saved successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to save segments: ' . $e->getMessage());
        }
    }

    /**
     * Export segments as JSON
     */
    public function export(Request $request, ResearcherAudio $audio)
    {
        // Authorization
        if ($audio->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        // Mark as exported
        $audio->markAsExported();

        // Generate JSON
        $jsonData = $audio->exportToJson();

        // Create filename
        $filename = Str::slug($audio->title ?: $audio->original_filename) . '_segments.json';

        return response()->json($jsonData, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Get segments for an audio file (AJAX)
     */
    public function index(Request $request, ResearcherAudio $audio)
    {
        // Authorization
        if ($audio->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $segments = $audio->segments()
            ->with('label')
            ->ordered()
            ->get()
            ->map(fn($segment) => [
                'id' => $segment->id,
                'start_time' => $segment->start_time,
                'end_time' => $segment->end_time,
                'duration' => $segment->duration,
                'label' => [
                    'id' => $segment->label->id,
                    'name' => $segment->label->name,
                    'color' => $segment->label->color,
                ],
                'notes' => $segment->notes,
            ]);

        return response()->json($segments);
    }
}