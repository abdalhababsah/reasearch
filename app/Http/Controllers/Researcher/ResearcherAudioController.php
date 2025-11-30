<?php

namespace App\Http\Controllers\Researcher;

use App\Http\Controllers\Controller;
use App\Models\ResearcherAudio;
use App\Models\Research;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ResearcherAudioController extends Controller
{
    /**
     * Display a listing of researcher's audio files
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $query = ResearcherAudio::query()
            ->with(['research:id,title_en,title_ar'])
            ->withCount('segments')
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
        $perPage = (int) $request->get('per_page', 15);
        $audios = $query->paginate($perPage)->withQueryString();

        $audiosData = $audios->getCollection()->map(function (ResearcherAudio $audio) {
            return [
                'id' => $audio->id,
                'title' => $audio->title,
                'original_filename' => $audio->original_filename,
                'formatted_duration' => $audio->formatted_duration,
                'duration_seconds' => $audio->duration_seconds,
                'formatted_file_size' => $audio->formatted_file_size,
                'file_size_bytes' => $audio->file_size_bytes,
                'status' => $audio->status,
                'total_segments' => $audio->segments_count ?? $audio->segments()->count(),
                'created_at' => $audio->created_at?->toDateTimeString(),
            ];
        });

        return Inertia::render('researcher/audios/Index', [
            'audios' => [
                'data' => $audiosData,
                'links' => $audios->linkCollection(),
                'meta' => [
                    'current_page' => $audios->currentPage(),
                    'last_page' => $audios->lastPage(),
                    'per_page' => $audios->perPage(),
                    'total' => $audios->total(),
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
                'total' => ResearcherAudio::forUser($user->id)->count(),
                'draft' => ResearcherAudio::forUser($user->id)->draft()->count(),
                'labeled' => ResearcherAudio::forUser($user->id)->labeled()->count(),
            ],
        ]);
    }

    /**
     * Show a single audio file.
     */
    public function show(Request $request, ResearcherAudio $audio): Response
    {
        if ($audio->user_id !== $request->user()->id) {
            abort(404);
        }

        $audio->loadCount('segments');

        return Inertia::render('researcher/audios/Show', [
            'audio' => [
                'id' => $audio->id,
                'title' => $audio->title,
                'description' => $audio->description,
                'original_filename' => $audio->original_filename,
                'duration_seconds' => $audio->duration_seconds,
                'formatted_duration' => $audio->formatted_duration,
                'file_size_bytes' => $audio->file_size_bytes,
                'formatted_file_size' => $audio->formatted_file_size,
                'mime_type' => $audio->mime_type,
                'status' => $audio->status,
                'is_public' => (bool) ($audio->is_public ?? false),
                'total_segments' => $audio->segments_count,
                'url' => Storage::url($audio->storage_path),
                'uploaded_at' => $audio->uploaded_at?->toDateTimeString(),
                'created_at' => $audio->created_at?->toDateTimeString(),
                'updated_at' => $audio->updated_at?->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Store a newly uploaded audio file
     */
    public function store(Request $request)
    {
        $request->validate([
            'audio_file' => 'required|file|mimes:mp3,wav,ogg,m4a,flac|max:102400', // Max 100MB
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $file = $request->file('audio_file');
            $originalFilename = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            
            // Generate unique stored filename
            $storedFilename = Str::random(40) . '.' . $extension;
            
            // Store in storage/app/public/researcher-audios/{user_id}/
            $storagePath = $file->storeAs(
                "researcher-audios/{$request->user()->id}",
                $storedFilename,
                'public'
            );

            // Extract audio metadata using getID3
            $audioInfo = $this->extractAudioMetadata($file->getRealPath());

            // Create audio record
            $audio = ResearcherAudio::create([
                'user_id' => $request->user()->id,
                'original_filename' => $originalFilename,
                'stored_filename' => $storedFilename,
                'storage_path' => $storagePath,
                'mime_type' => $file->getMimeType(),
                'file_size_bytes' => $file->getSize(),
                'duration_seconds' => $audioInfo['duration'] ?? null,
                'metadata' => $audioInfo['metadata'] ?? null,
                'title' => $request->title ?? pathinfo($originalFilename, PATHINFO_FILENAME),
                'description' => $request->description,
                'uploaded_at' => now(),
            ]);

            DB::commit();

            return back()->with('success', 'Audio file uploaded successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Clean up uploaded file if exists
            if (isset($storagePath) && Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }

            return back()->with('error', 'Failed to upload audio file: ' . $e->getMessage());
        }
    }

    /**
     * Update audio metadata
     */
    public function update(Request $request, ResearcherAudio $audio)
    {
        // Authorization
        if ($audio->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $audio->update($request->only(['title', 'description']));

        return back()->with('success', 'Audio updated successfully!');
    }

    /**
     * Delete audio file
     */
    public function destroy(Request $request, ResearcherAudio $audio)
    {
        // Authorization
        if ($audio->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        try {
            DB::beginTransaction();

            // Delete physical file
            if (Storage::disk('public')->exists($audio->storage_path)) {
                Storage::disk('public')->delete($audio->storage_path);
            }

            // Soft delete audio (cascades to segments)
            $audio->delete();

            DB::commit();

            return back()->with('success', 'Audio file deleted successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete audio: ' . $e->getMessage());
        }
    }

    /**
     * Extract audio metadata using getID3 if available.
     */
    private function extractAudioMetadata(string $filePath): array
    {

        try {
            $getID3 = new \getID3();
            $fileInfo = $getID3->analyze($filePath);

            return [
                'duration' => $fileInfo['playtime_seconds'] ?? null,
                'metadata' => [
                    'bitrate' => $fileInfo['audio']['bitrate'] ?? null,
                    'sample_rate' => $fileInfo['audio']['sample_rate'] ?? null,
                    'channels' => $fileInfo['audio']['channels'] ?? null,
                    'codec' => $fileInfo['audio']['dataformat'] ?? null,
                ],
            ];
        } catch (\Exception $e) {
            \Log::error('Failed to extract audio metadata', [
                'error' => $e->getMessage(),
                'file' => $filePath,
            ]);

            return [
                'duration' => null,
                'metadata' => null,
            ];
        }
    }
}
