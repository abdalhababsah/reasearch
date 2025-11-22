<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = session('locale', config('app.locale'));
        if (! in_array($locale, ['en', 'ar'], true)) {
            $locale = config('app.locale');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
