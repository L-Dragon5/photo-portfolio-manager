<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAlbumRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'event_id' => 'nullable|numeric',
            'album_id' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'url_alias' => 'nullable|string',
            'password' => 'nullable|string',
            'date_taken' => 'nullable|date',
            'is_press' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
            'photos' => 'nullable|array',
        ];
    }
}
