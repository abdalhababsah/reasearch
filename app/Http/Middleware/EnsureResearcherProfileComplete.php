<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureResearcherProfileComplete
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only check for researchers
        if ($user && $user->role && $user->role->name === 'researcher') {
            $user->load('researcherProfile');
            $profile = $user->researcherProfile;

            // Check if profile exists and has required fields
            if (!$profile || !$profile->bio) {
                // Allow access but add warning message
                if (!$request->routeIs(['researcher.profile.*', 'profile.edit'])) {
                    $request->session()->flash('profile_incomplete', true);
                    $request->session()->flash('warning', 'Please complete your profile to unlock all features.');
                }
            }
        }

        return $next($request);
    }
}
