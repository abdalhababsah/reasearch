<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Research extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'researcher_id',
        'title',
        'abstract',
        'keywords',
        'status',
        'is_public',
        'allow_document_view',
        'allow_dataset_browse',
        'wallpaper_file_id',
        'current_version_id',
        'doi',
        'journal_name',
        'year',
        'published_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'allow_document_view' => 'boolean',
            'allow_dataset_browse' => 'boolean',
            'year' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Get the researcher (user) that owns the research.
     */
    public function researcher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'researcher_id');
    }

    /**
     * Get the research versions for the research.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ResearchVersion::class);
    }

    /**
     * Get the files for the research.
     */
    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }

    /**
     * Get the wallpaper file for the research.
     */
    public function wallpaperFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'wallpaper_file_id');
    }

    /**
     * Get the current version for the research.
     */
    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(ResearchVersion::class, 'current_version_id');
    }

    /**
     * Get the categories for the research.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'research_categories');
    }

    /**
     * Get the tags for the research.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'research_tags');
    }
}
