<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAlbumRequest extends FormRequest
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
            'name' => 'sometimes|required|string|max:255',
            'event_id' => 'sometimes|nullable|numeric',
            'notes' => 'sometimes|nullable|string',
            'cover_image_id' => 'sometimes|nullable|numeric',
            'url_alias' => 'sometimes|string',
            'password' => 'sometimes|nullable|string',
            'date_taken' => 'sometimes|nullable|date',
            'is_press' => 'sometimes|nullable|boolean',
            'is_public' => 'sometimes|nullable|boolean',
        ];
    }
}
