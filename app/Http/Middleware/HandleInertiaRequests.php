<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        
        // Format user data for frontend
        $userData = null;
        if ($user) {
            $user->load('role');
            
            // Combine first_name and last_name for the name field
            $fullName = trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));
            $fullName = $fullName !== '' ? $fullName : $user->email; // Fallback to email if no name
            
            $userData = [
                'id' => $user->id,
                'name' => $fullName,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'avatar' => $user->avatar ?? null,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'two_factor_enabled' => $user->two_factor_confirmed_at !== null,
                'created_at' => $user->created_at->toIso8601String(),
                'updated_at' => $user->updated_at->toIso8601String(),
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                ] : null,
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'locale' => app()->getLocale(),
            'direction' => app()->getLocale() === 'ar' ? 'rtl' : 'ltr',
            'auth' => [
                'user' => $userData,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'warning' => $request->session()->get('warning'),
                'error' => $request->session()->get('error'),
                'profile_incomplete' => $request->session()->get('profile_incomplete'),
            ],
        ];
    }
}
