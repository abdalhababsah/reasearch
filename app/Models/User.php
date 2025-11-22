<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'role_id',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get the user's full name.
     */
    public function getNameAttribute(): ?string
    {
        if (!$this->first_name && !$this->last_name) {
            return null;
        }
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Get the role that owns the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the researches for the user (as researcher).
     */
    public function researches(): HasMany
    {
        return $this->hasMany(Research::class, 'researcher_id');
    }

    /**
     * Get the researcher profile for the user.
     */
    public function researcherProfile(): HasOne
    {
        return $this->hasOne(ResearcherProfile::class);
    }

    /**
     * Get the majors for the user.
     */
    public function majors(): BelongsToMany
    {
        return $this->belongsToMany(ResearcherMajor::class, 'researcher_major_user', 'user_id', 'major_id')
            ->using(ResearcherMajorUser::class)
            ->withTimestamps();
    }
}
