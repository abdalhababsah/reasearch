<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LanguageController extends Controller
{
    /**
     * Update the active locale for the current user session.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', Rule::in(['en', 'ar'])],
        ]);

        session(['locale' => $validated['locale']]);

        return back();
    }
}
