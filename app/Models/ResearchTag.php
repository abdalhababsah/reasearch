<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResearchTag extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'research_id',
        'tag_id',
    ];

    /**
     * Get the research.
     */
    public function research(): BelongsTo
    {
        return $this->belongsTo(Research::class);
    }

    /**
     * Get the tag.
     */
    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }
}
