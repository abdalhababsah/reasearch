<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class File extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'research_id',
        'research_version_id',
        'type',
        'original_name',
        'storage_path',
        'mime_type',
        'size_bytes',
        'is_primary_doc',
        'is_downloadable',
        'checksum',
        'uploaded_by',
        'uploaded_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'is_primary_doc' => 'boolean',
            'is_downloadable' => 'boolean',
            'uploaded_at' => 'datetime',
        ];
    }

    /**
     * Get the research that owns the file.
     */
    public function research(): BelongsTo
    {
        return $this->belongsTo(Research::class);
    }

    /**
     * Get the research version that owns the file.
     */
    public function researchVersion(): BelongsTo
    {
        return $this->belongsTo(ResearchVersion::class);
    }

    /**
     * Get the user that uploaded the file.
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
