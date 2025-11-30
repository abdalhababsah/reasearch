<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;
use App\Models\ResearcherMajor;
class ResearcherProfile extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'profile_image',
        'bio',
        'website',
        'phone',
        'address',
        'linkedin_url',
        'github_url',
    ];

    /**
     * Get the user that owns the profile.
     */
    protected $appends = ['profile_image_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getProfileImageUrlAttribute(): ?string
    {
        if (!$this->profile_image) {
            return null;
        }

        return Storage::url($this->profile_image);
    }
    /**
     * Get the experiences for the profile.
     */
    public function experiences(): HasMany
    {
        return $this->hasMany(ResearcherExperience::class);
    }

    /**
     * Get the educations for the profile.
     */
    public function educations(): HasMany
    {
        return $this->hasMany(ResearcherEducation::class);
    }

    /**
     * Get the majors associated with the profile.
     */
    public function majors(): BelongsToMany
    {
        return $this->belongsToMany(ResearcherMajor::class, 'researcher_major_user', 'user_id', 'major_id', 'user_id', 'id');
    }
}
