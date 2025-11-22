<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearcherProfile extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
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
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
}
