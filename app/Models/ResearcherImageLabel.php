<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearcherImageLabel extends Model
{
    protected $table = 'researcher_image_labels';
    protected $fillable = [
        'researcher_image_id',
        'name',
        'color',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the image this label belongs to
     */
    public function image(): BelongsTo
    {
        return $this->belongsTo(ResearcherImage::class, 'researcher_image_id');
    }

    /**
     * Get all annotations using this label
     */
    public function annotations(): HasMany
    {
        return $this->hasMany(ResearcherImageAnnotation::class, 'label_id');
    }

    /**
     * Scope: Active labels
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: For specific image
     */
    public function scopeForImage($query, int $imageId)
    {
        return $query->where('researcher_image_id', $imageId);
    }

    /**
     * Check if label is in use
     */
    public function isInUse(): bool
    {
        return $this->annotations()->exists();
    }

    /**
     * Get annotation count
     */
    public function getAnnotationCountAttribute(): int
    {
        return $this->annotations()->count();
    }
}