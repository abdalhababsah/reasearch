<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ResearcherMajorUser extends Pivot
{
    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the major.
     */
    public function major(): BelongsTo
    {
        return $this->belongsTo(ResearcherMajor::class);
    }
}
