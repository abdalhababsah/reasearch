<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResearcherImageAnnotation extends Model
{
    protected $table = 'researcher_image_annotations';
    protected $fillable = [
        'researcher_image_id',
        'label_id',
        'x',
        'y',
        'width',
        'height',
        'notes',
    ];

    protected $casts = [
        'x' => 'decimal:2',
        'y' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
    ];

    /**
     * Get the image this annotation belongs to
     */
    public function image(): BelongsTo
    {
        return $this->belongsTo(ResearcherImage::class, 'researcher_image_id');
    }

    /**
     * Get the label for this annotation
     */
    public function label(): BelongsTo
    {
        return $this->belongsTo(ResearcherImageLabel::class, 'label_id');
    }

    /**
     * Scope: For specific image
     */
    public function scopeForImage($query, int $imageId)
    {
        return $query->where('researcher_image_id', $imageId);
    }

    /**
     * Scope: With specific label
     */
    public function scopeWithLabel($query, int $labelId)
    {
        return $query->where('label_id', $labelId);
    }

    /**
     * Get bounding box area
     */
    public function getAreaAttribute(): float
    {
        return $this->width * $this->height;
    }

    /**
     * Validate bounding box
     */
    public static function boot()
    {
        parent::boot();

        static::creating(function ($annotation) {
            if ($annotation->width <= 0 || $annotation->height <= 0) {
                throw new \InvalidArgumentException('Width and height must be positive');
            }
        });

        static::updating(function ($annotation) {
            if ($annotation->width <= 0 || $annotation->height <= 0) {
                throw new \InvalidArgumentException('Width and height must be positive');
            }
        });
    }
}