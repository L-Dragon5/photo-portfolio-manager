<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterPreviewUploadRequest extends FormRequest
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
        return [
            'key' => ['required', 'string', 'starts_with:media-uploads/tmp/'],
            'filename' => ['required', 'string', 'max:255'],
            'mime_type' => ['required', 'string', 'in:image/jpeg,image/png,image/webp'],
            'size' => ['required', 'integer', 'min:1', 'max:52428800'],
            'width' => ['required', 'integer', 'min:1'],
            'height' => ['required', 'integer', 'min:1'],
            'date_taken' => ['nullable', 'integer'],
        ];
    }
}
