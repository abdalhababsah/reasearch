<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResearcherAudioSegment extends Model
{
    protected $fillable = [
        'researcher_audio_id',
        'label_id',
        'start_time',
        'end_time',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'decimal:3',
        'end_time' => 'decimal:3',
        'duration' => 'decimal:3',
    ];

    protected $appends = ['label_name', 'label_color'];

    /**
     * Get the audio file this segment belongs to
     */
    public function audio(): BelongsTo
    {
        return $this->belongsTo(ResearcherAudio::class, 'researcher_audio_id');
    }

    /**
     * Get the label for this segment
     */
    public function label(): BelongsTo
    {
        return $this->belongsTo(ResearcherAudioLabel::class, 'label_id');
    }

    /**
     * Get label name (accessor for convenience)
     */
    public function getLabelNameAttribute(): string
    {
        return $this->label?->name ?? 'Unknown';
    }

    /**
     * Get label color (accessor for convenience)
     */
    public function getLabelColorAttribute(): string
    {
        return $this->label?->color ?? '#6B7280';
    }

    /**
     * Scope: Order by start time
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('start_time');
    }

    /**
     * Scope: Get segments for a specific audio
     */
    public function scopeForAudio($query, int $audioId)
    {
        return $query->where('researcher_audio_id', $audioId);
    }

    /**
     * Scope: Get segments with a specific label
     */
    public function scopeWithLabel($query, int $labelId)
    {
        return $query->where('label_id', $labelId);
    }

    /**
     * Validate time boundaries
     */
    public static function boot()
    {
        parent::boot();

        static::creating(function ($segment) {
            if ($segment->start_time >= $segment->end_time) {
                throw new \InvalidArgumentException('Start time must be less than end time');
            }
        });

        static::updating(function ($segment) {
            if ($segment->start_time >= $segment->end_time) {
                throw new \InvalidArgumentException('Start time must be less than end time');
            }
        });
    }

    /**
     * Get formatted time range
     */
    public function getFormattedTimeRangeAttribute(): string
    {
        return sprintf(
            '%s - %s',
            $this->formatTime($this->start_time),
            $this->formatTime($this->end_time)
        );
    }

    /**
     * Format time as MM:SS
     */
    private function formatTime(float $seconds): string
    {
        $minutes = floor($seconds / 60);
        $secs = $seconds % 60;
        return sprintf('%02d:%05.2f', $minutes, $secs);
    }
}