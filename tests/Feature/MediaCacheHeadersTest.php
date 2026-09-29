<?php

declare(strict_types=1);

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
