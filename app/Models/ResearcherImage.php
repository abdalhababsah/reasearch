<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class ResearcherImage extends Model
{
    protected $table = 'researcher_images';
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'original_filename',
        'stored_filename',
        'storage_path',
        'mime_type',
        'file_size_bytes',
        'width',
        'height',
        'status',
        'title',
        'description',
        'uploaded_at',
        'labeled_at',
    ];

    protected $casts = [
        'file_size_bytes' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'uploaded_at' => 'datetime',
        'labeled_at' => 'datetime',
    ];

    protected $appends = ['url', 'formatted_file_size', 'dimensions'];

    /**
     * Get the user who owns this image
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all annotations for this image
     */
    public function annotations(): HasMany
    {
        return $this->hasMany(ResearcherImageAnnotation::class);
    }

    /**
     * Get all labels for this image
     */
    public function labels(): HasMany
    {
        return $this->hasMany(ResearcherImageLabel::class);
    }

    /**
     * Get the image URL
     */
    public function getUrlAttribute(): string
    {
        return Storage::url($this->storage_path);
    }

    /**
     * Get formatted file size
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size_bytes;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get image dimensions string
     */
    public function getDimensionsAttribute(): string
    {
        if (!$this->width || !$this->height) {
            return 'Unknown';
        }
        return "{$this->width} × {$this->height}";
    }

    /**
     * Scope: Filter by user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Only labeled images
     */
    public function scopeLabeled($query)
    {
        return $query->where('status', 'labeled')
            ->orWhere('status', 'exported');
    }

    /**
     * Scope: Only draft
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope: Search
     */
    public function scopeSearch($query, ?string $term)
    {
        if (!$term) {
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
     * Mark as labeled
     */
    public function markAsLabeled(): void
    {
        $this->update([
            'status' => 'labeled',
            'labeled_at' => now(),
        ]);
    }

    /**
     * Mark as exported
     */
    public function markAsExported(): void
    {
        $this->update(['status' => 'exported']);
    }

    /**
     * Get total annotations count
     */
    public function getTotalAnnotationsAttribute(): int
    {
        return $this->annotations()->count();
    }

    /**
     * Check if image has annotations
     */
    public function hasAnnotations(): bool
    {
        return $this->annotations()->exists();
    }

    /**
     * Export to JSON
     */
    public function exportToJson(): array
    {
        return [
            'image_id' => $this->id,
            'filename' => $this->original_filename,
            'title' => $this->title,
            'description' => $this->description,
            'dimensions' => [
                'width' => $this->width,
                'height' => $this->height,
            ],
            'researcher' => [
                'id' => $this->user_id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'labeled_at' => $this->labeled_at?->toIso8601String(),
            'annotations' => $this->annotations()
                ->with('label')
                ->get()
                ->map(fn($annotation) => [
                    'id' => $annotation->id,
                    'bounding_box' => [
                        'x' => (float) $annotation->x,
                        'y' => (float) $annotation->y,
                        'width' => (float) $annotation->width,
                        'height' => (float) $annotation->height,
                    ],
                    'label' => [
                        'id' => $annotation->label->id,
                        'name' => $annotation->label->name,
                        'color' => $annotation->label->color,
                    ],
                    'notes' => $annotation->notes,
                ])
                ->toArray(),
            'statistics' => [
                'total_annotations' => $this->total_annotations,
            ],
        ];
    }
}