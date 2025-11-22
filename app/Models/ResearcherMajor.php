<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ResearcherMajor extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * Get the users for the major.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'researcher_major_user', 'major_id', 'user_id')
            ->using(ResearcherMajorUser::class)
            ->withTimestamps();
    }
}
