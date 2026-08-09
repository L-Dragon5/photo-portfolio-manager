<?php

declare(strict_types=1);

use App\Models\Album;
use App\Models\Photo;
use Illuminate\Support\Str;

/**
 * The admin upload drawer serialises every photo in the album at once, so the
 * per-photo payload has to stay lean. A base64 placeholder used to ride along
 * in `srcSet` as a 32w candidate no browser would ever pick.
 */
it('keeps the srcSet free of the base64 tiny placeholder', function (): void {
    $album = Album::query()->create([
        'name' => 'Payload Album',
        'url_alias' => 'payload-album-' . uniqid(),
    ]);

    $photo = Photo::query()->create([
        'model_type' => Album::class,
        'model_id' => $album->id,
        'uuid' => (string) Str::uuid(),
        'collection_name' => 'photos',
        'name' => 'shot',
        'file_name' => 'shot.jpg',
        'mime_type' => 'image/jpeg',
        'disk' => 'public',
        'conversions_disk' => 'public',
        'size' => 1000,
        'manipulations' => [],
        'custom_properties' => ['width' => 4000, 'height' => 3000],
        'generated_conversions' => [],
        'responsive_images' => [
            'media_library_original' => [
                'urls' => [
                    'shot___media_library_original_300_225.jpg',
                    'shot___media_library_original_600_450.jpg',
                ],
                'base64svg' => base64_encode('<svg/>'),
            ],
        ],
        'order_column' => 1,
    ]);

    $srcSet = collect($photo->html['srcSet']);

    expect($srcSet)->toHaveCount(2)
        ->and($srcSet->pluck('width')->all())->toBe([300, 600])
        ->and($srcSet->pluck('src')->filter(fn (string $src): bool => str_contains($src, 'data:image')))->toBeEmpty();
});
