<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tagId = $this->route('tag')?->id ?? null;

        return [
            'name_en' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tags', 'name_en')->ignore($tagId),
            ],
            'name_ar' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tags', 'name_ar')->ignore($tagId),
            ],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tags', 'slug')->ignore($tagId),
            ],
        ];
    }
}
