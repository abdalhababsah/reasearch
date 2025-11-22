<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearchVersion extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'research_id',
        'version_number',
        'label',
        'title',
        'abstract',
        'keywords',
        'doi',
        'journal_name',
        'year',
        'status',
        'is_current',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'version_number' => 'integer',
            'year' => 'integer',
            'is_current' => 'boolean',
        ];
    }

    /**
     * Get the research that owns the version.
     */
    public function research(): BelongsTo
    {
        return $this->belongsTo(Research::class);
    }

    /**
     * Get the files for the research version.
     */
    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }
}
