<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteUploadRequest extends FormRequest
{
    /**
     * Keys are generated server-side by UploadController::sign(), so anything
     * that does not match the shape we hand out is a forged key.
     */
    public const KEY_PATTERN = '/^tmp\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,5}$/';

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
            'collection' => ['required', 'string', 'in:photos,previews'],
            'files' => ['required', 'array', 'max:200'],
            'files.*.key' => ['required', 'string', 'regex:' . self::KEY_PATTERN],
            'files.*.name' => ['required', 'string', 'max:255'],
            'files.*.width' => ['nullable', 'integer', 'min:1'],
            'files.*.height' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'files.*.key.regex' => 'Upload key is not one this server issued.',
        ];
    }
}
