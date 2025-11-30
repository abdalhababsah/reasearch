<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class ResearcherAudio extends Model
{
    use SoftDeletes;

    protected $table = 'researcher_audios';

    protected $fillable = [
        'user_id',
        'original_filename',
        'stored_filename',
        'storage_path',
        'mime_type',
        'file_size_bytes',
        'duration_seconds',
        'metadata',
        'status',
        'title',
        'description',
        'uploaded_at',
        'labeled_at',
    ];

    protected $casts = [
        'file_size_bytes' => 'integer',
        'duration_seconds' => 'decimal:2',
        'metadata' => 'array',
        'uploaded_at' => 'datetime',
        'labeled_at' => 'datetime',
    ];

    protected $appends = ['url', 'formatted_file_size', 'formatted_duration'];

    /**
     * Get the user (researcher) who owns this audio
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * (Optional) Link to a research record if attached.
     */
    public function research(): BelongsTo
    {
        return $this->belongsTo(Research::class);
    }

    /**
     * Get all segments for this audio
     */
    public function segments(): HasMany
    {
        return $this->hasMany(ResearcherAudioSegment::class);
    }

    /**
     * Get the audio URL from storage
     */
    public function getUrlAttribute(): string
    {
        return Storage::url($this->storage_path);
    }

    /**
     * Get formatted file size (human readable)
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size_bytes;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2).' '.$units[$i];
    }

    /**
     * Get formatted duration (MM:SS)
     */
    public function getFormattedDurationAttribute(): string
    {
        if (! $this->duration_seconds) {
            return '00:00';
        }

        $minutes = floor($this->duration_seconds / 60);
        $seconds = $this->duration_seconds % 60;

        return sprintf('%02d:%02d', $minutes, $seconds);
    }

    /**
     * Scope: Filter by user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Only labeled audios (with segments)
     */
    public function scopeLabeled($query)
    {
        return $query->where('status', 'labeled')
            ->orWhere('status', 'exported');
    }

    /**
     * Scope: Only draft (not labeled yet)
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope: Search by filename or title
     */
    public function scopeSearch($query, ?string $term)
    {
        if (! $term) {
            return $query;
        }

        $like = "%{$term}%";

        return $query->where(function ($q) use ($like) {
            $q->where('original_filename', 'like', $like)
                ->orWhere('title', 'like', $like)
                ->orWhere('description', 'like', $like);
        });
    }

    /**
     * Mark audio as labeled (when segments are added)
     */
    public function markAsLabeled(): void
    {
        $this->update([
            'status' => 'labeled',
            'labeled_at' => now(),
        ]);
    }

    /**
     * Mark audio as exported
     */
    public function markAsExported(): void
    {
        $this->update(['status' => 'exported']);
    }

    /**
     * Get total segments count
     */
    public function getTotalSegmentsAttribute(): int
    {
        return $this->segments()->count();
    }

    /**
     * Get total labeled duration (sum of all segments)
     */
    public function getTotalLabeledDurationAttribute(): float
    {
        return $this->segments()->sum('duration') ?? 0.0;
    }

    /**
     * Check if audio has segments
     */
    public function hasSegments(): bool
    {
        return $this->segments()->exists();
    }

    /**
     * Export segments as JSON
     */
    public function exportToJson(): array
    {
        return [
            'audio_id' => $this->id,
            'filename' => $this->original_filename,
            'title' => $this->title,
            'description' => $this->description,
            'duration' => $this->duration_seconds,
            'researcher' => [
                'id' => $this->user_id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'labeled_at' => $this->labeled_at?->toIso8601String(),
            'metadata' => $this->metadata,
            'segments' => $this->segments()
                ->with('label')
                ->orderBy('start_time')
                ->get()
                ->map(fn ($segment) => [
                    'id' => $segment->id,
                    'start_time' => (float) $segment->start_time,
                    'end_time' => (float) $segment->end_time,
                    'duration' => (float) $segment->duration,
                    'label' => [
                        'id' => $segment->label->id,
                        'name' => $segment->label->name,
                        'color' => $segment->label->color,
                    ],
                    'notes' => $segment->notes,
                ])
                ->toArray(),
            'statistics' => [
                'total_segments' => $this->total_segments,
                'total_labeled_duration' => (float) $this->total_labeled_duration,
                'coverage_percentage' => $this->duration_seconds > 0
                    ? round(($this->total_labeled_duration / $this->duration_seconds) * 100, 2)
                    : 0,
            ],
        ];
    }
}
