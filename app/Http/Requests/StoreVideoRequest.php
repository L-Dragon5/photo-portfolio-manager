<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Support\YouTube;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreVideoRequest extends FormRequest
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
            'url' => ['required', 'string', $this->youTubeUrlRule()],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'album_id' => ['nullable', 'integer', 'exists:albums,id'],
            'url_alias' => ['nullable', 'string', 'max:255'],
            'date_taken' => ['nullable', 'date'],
            'is_public' => ['boolean'],
        ];
    }

    private function youTubeUrlRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (is_null(YouTube::idFromUrl((string) $value))) {
                $fail('That is not a recognisable YouTube video URL.');
            }
        };
    }
}
