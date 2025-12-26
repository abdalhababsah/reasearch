<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearcherAudioLabel extends Model
{
    protected $fillable = [
        'researcher_audio_id',
        'name',
        'color',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the audio file this label belongs to
     */
    public function audio(): BelongsTo
    {
        return $this->belongsTo(ResearcherAudio::class, 'researcher_audio_id');
    }

    /**
     * Get all segments using this label
     */
    public function segments(): HasMany
    {
        return $this->hasMany(ResearcherAudioSegment::class, 'label_id');
    }

    /**
     * Scope to get only active labels
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get labels for a specific audio file
     */
    public function scopeForAudio($query, int $audioId)
    {
        return $query->where('researcher_audio_id', $audioId);
    }

    /**
     * Check if label is in use by any segments
     */
    public function isInUse(): bool
    {
        return $this->segments()->exists();
    }

    /**
     * Get count of segments using this label
     */
    public function getSegmentCountAttribute(): int
    {
        return $this->segments()->count();
    }
}