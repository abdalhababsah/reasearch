<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResearcherProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bio' => ['required', 'string', 'min:50', 'max:2000'],
            'website' => ['nullable', 'url', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'profile_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'major_ids' => ['nullable', 'array'],
            'major_ids.*' => ['exists:researcher_majors,id'],
        ];
    }
}
