<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SignUploadRequest extends FormRequest
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
            'files' => ['required', 'array', 'max:200'],
            'files.*.name' => ['required', 'string', 'max:255'],
            'files.*.type' => ['required', 'string', 'in:image/jpeg,image/png'],
            'files.*.size' => ['required', 'integer', 'min:1', 'max:' . self::MAX_BYTES],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'files.*.type.in' => 'Only JPEG and PNG images can be uploaded.',
            'files.*.size.max' => 'Images must be smaller than 500MB.',
        ];
    }
    public const MAX_BYTES = 500 * 1024 * 1024;
}
