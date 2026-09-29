<?php

declare(strict_types=1);

use App\Models\Album;
use App\Models\Photo;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Filesystem;

/**
 * Spatie merges these headers into every S3 write: originals, conversions and
 * responsive variants. Media URLs never change content, so browsers should
 * keep them for a year without revalidating.
 */
it('writes media to S3 with a one-year immutable cache header', function (): void {
    $headers = app(Filesystem::class)->getRemoteHeadersForFile('photo.jpg', [], 'image/jpeg');

    expect($headers['CacheControl'])->toBe('public, max-age=31536000, immutable');
});

/**
 * The immutable header is only safe while URLs are content-stable. Turning on
 * version_urls appends ?v= and implies files can change under the same path.
 */
it('keeps media URLs unversioned so the immutable header stays correct', function (): void {
    expect(config('media-library.version_urls'))->toBeFalse();
});

/**
 * The bucket only serves reads through CloudFront, so every public media URL
 * must be built from the disk's `url` (AWS_URL), never the raw S3 endpoint.
 */
it('builds S3 media URLs from the configured CDN base url', function (): void {
    config(['filesystems.disks.s3.url' => 'https://cdn.example.test', 'filesystems.disks.s3.bucket' => 'test-bucket']);

    $album = Album::query()->create(['name' => 'CDN', 'url_alias' => 'cdn-' . uniqid()]);
    $photo = Photo::query()->create([
        'model_type' => Album::class,
        'model_id' => $album->id,
        'uuid' => (string) Str::uuid(),
        'collection_name' => 'photos',
        'name' => 'shot',
        'file_name' => 'shot.jpg',
        'mime_type' => 'image/jpeg',
        'disk' => 's3',
        'conversions_disk' => 's3',
        'size' => 1000,
        'manipulations' => [],
        'custom_properties' => [],
        'generated_conversions' => [],
        'responsive_images' => ['media_library_original' => ['urls' => ['shot___media_library_original_300_225.jpg'], 'base64svg' => '']],
        'order_column' => 1,
    ]);

    expect($photo->html['src'])->toBe("https://cdn.example.test/{$photo->id}/shot.jpg")
        ->and($photo->html['srcSet'][0]['src'])->toBe("https://cdn.example.test/{$photo->id}/responsive-images/shot___media_library_original_300_225.jpg");
});
