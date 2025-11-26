<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResearchRequest extends FormRequest
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
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['required', 'string', 'max:255'],
            'abstract_en' => ['nullable', 'string'],
            'abstract_ar' => ['nullable', 'string'],
            'keywords_en' => ['nullable', 'string', 'max:255'],
            'keywords_ar' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['draft', 'under_review', 'published', 'archived'])],
            'is_public' => ['nullable', 'boolean'],
            
            // Files
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:102400'], // 100MB max per file
            'primary_file_index' => ['nullable', 'integer', 'min:0'],
            
            // Categories and Tags
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
            
            // Wallpaper
            'wallpaper' => ['nullable', 'image', 'max:10240'], // 10MB max
            
            // For edit: file removal
            'remove_file_ids' => ['nullable', 'array'],
            'remove_file_ids.*' => ['integer', 'exists:files,id'],
            'remove_wallpaper' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title_en.required' => 'The English title is required.',
            'title_ar.required' => 'The Arabic title is required.',
            'files.*.max' => 'Each file must not exceed 100MB.',
            'wallpaper.image' => 'The wallpaper must be an image file.',
            'wallpaper.max' => 'The wallpaper must not exceed 10MB.',
            'category_ids.*.exists' => 'One or more selected categories are invalid.',
            'tag_ids.*.exists' => 'One or more selected tags are invalid.',
        ];
    }
}