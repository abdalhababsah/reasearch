<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the main dashboard and redirect based on user role.
     */
    public function index(): Response|\Illuminate\Http\RedirectResponse
    {
        $user = auth()->user();
        $user->load('role', 'researcherProfile');
        
        // Redirect based on role
        if ($user->role) {
            if ($user->role->name === 'admin') {
                return redirect()->route('admin.dashboard');
            } elseif ($user->role->name === 'researcher') {
                return redirect()->route('researcher.dashboard');
            }
        }
        
        // Fallback to default dashboard
        return Inertia::render('dashboard');
    }

    /**
     * Display the admin dashboard.
     */
    public function admin(): Response
    {
        return Inertia::render('admin/dashboard');
    }

    /**
     * Display the researcher dashboard.
     */
    public function researcher(Request $request): Response
    {
        $user = $request->user();
        $user->load('researcherProfile');
        $profile = $user->researcherProfile;
        
        $profileIncomplete = !$profile || !$profile->bio;
        
        return Inertia::render('researcher/dashboard', [
            'profileIncomplete' => $profileIncomplete,
            'warning' => $profileIncomplete 
                ? 'Please complete your profile to unlock all features.' 
                : null,
        ]);
    }
}
