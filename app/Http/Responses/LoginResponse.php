<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $user = Auth::user();
        
        // Load role relationship
        if ($user) {
            $user->load('role');
            
            // Redirect based on role
            if ($user->role) {
                if ($user->role->name === 'admin') {
                    return redirect()->route('admin.dashboard');
                } elseif ($user->role->name === 'researcher') {
                    return redirect()->route('researcher.dashboard');
                }
            }
        }
        
        // Fallback to default dashboard
        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->route('dashboard');
    }
}

