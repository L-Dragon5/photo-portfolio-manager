<?php

declare(strict_types=1);

use App\Jobs\IngestUploadedMedia;
use App\Models\Album;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\Conversions\Jobs\PerformConversionsJob;
use Spatie\MediaLibrary\ResponsiveImages\Jobs\GenerateResponsiveImagesJob;

/**
 * The fake s3 disk is a local adapter and cannot presign, so stand in a
 * deterministic builder for the one thing the real driver provides.
 */
function fakeS3(): void
{
    Storage::fake('s3');
    Storage::disk('s3')->buildTemporaryUploadUrlsUsing(fn (string $path): array => [
        'url' => 'https://bucket.s3.amazonaws.com/' . $path . '?signed=1',
        'headers' => ['Content-Type' => 'application/octet-stream'],
    ]);
}

function validKey(string $extension = 'jpg'): string
{
    return 'tmp/' . \Illuminate\Support\Str::uuid()->toString() . '.' . $extension;
}

beforeEach(function (): void {
    $this->actingAs(User::factory()->create());
});

it('issues one presigned url per file', function (): void {
    fakeS3();
    $album = Album::factory()->create();

    $response = $this->postJson("/admin/albums/{$album->id}/uploads/sign", [
        'files' => [
            ['name' => 'one.jpg', 'type' => 'image/jpeg', 'size' => 4_000_000],
            ['name' => 'two.png', 'type' => 'image/png', 'size' => 2_000_000],
        ],
    ]);

    $response->assertOk()->assertJsonCount(2, 'uploads');

    $uploads = $response->json('uploads');

    expect($uploads[0]['name'])->toBe('one.jpg')
        ->and($uploads[0]['key'])->toMatch('/^tmp\/[0-9a-f-]{36}\.jpg$/')
        ->and($uploads[1]['key'])->toMatch('/^tmp\/[0-9a-f-]{36}\.png$/')
        ->and($uploads[0]['url'])->toContain('signed=1');
});

it('derives the key extension from the mime type, not the filename', function (): void {
    fakeS3();
    $album = Album::factory()->create();

    $key = $this->postJson("/admin/albums/{$album->id}/uploads/sign", [
        'files' => [
            ['name' => '../../evil.php', 'type' => 'image/jpeg', 'size' => 1000],
        ],
    ])->assertOk()->json('uploads.0.key');

    expect($key)->toEndWith('.jpg')->not->toContain('..');
});

it('rejects file types that are not images', function (): void {
    fakeS3();
    $album = Album::factory()->create();

    $this->postJson("/admin/albums/{$album->id}/uploads/sign", [
        'files' => [['name' => 'movie.mp4', 'type' => 'video/mp4', 'size' => 1000]],
    ])->assertStatus(422)->assertJsonValidationErrors('files.0.type');
});

it('rejects files over the size ceiling', function (): void {
    fakeS3();
    $album = Album::factory()->create();

    $this->postJson("/admin/albums/{$album->id}/uploads/sign", [
        'files' => [['name' => 'huge.jpg', 'type' => 'image/jpeg', 'size' => 600 * 1024 * 1024]],
    ])->assertStatus(422)->assertJsonValidationErrors('files.0.size');
});

it('queues an ingest job per completed file', function (): void {
    Bus::fake();
    $album = Album::factory()->create();

    $this->postJson("/admin/albums/{$album->id}/uploads/complete", [
        'collection' => 'photos',
        'files' => [
            ['key' => validKey(), 'name' => 'a.jpg', 'width' => 100, 'height' => 200],
            ['key' => validKey(), 'name' => 'b.jpg', 'width' => 300, 'height' => 400],
        ],
    ])->assertStatus(202)->assertJson(['queued' => 2]);

    Bus::assertDispatchedTimes(IngestUploadedMedia::class, 2);
});

it('refuses keys the server did not issue', function (string $key): void {
    Bus::fake();
    $album = Album::factory()->create();

    $this->postJson("/admin/albums/{$album->id}/uploads/complete", [
        'collection' => 'photos',
        'files' => [['key' => $key, 'name' => 'a.jpg']],
    ])->assertStatus(422)->assertJsonValidationErrors('files.0.key');

    Bus::assertNotDispatched(IngestUploadedMedia::class);
})->with([
    'path traversal' => 'tmp/../../.env',
    'outside tmp' => 'photos/1/original.jpg',
    'not a uuid' => 'tmp/whatever.jpg',
    'nested' => 'tmp/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/../secret.jpg',
]);

it('refuses an unknown collection', function (): void {
    Bus::fake();
    $album = Album::factory()->create();

    $this->postJson("/admin/albums/{$album->id}/uploads/complete", [
        'collection' => 'secrets',
        'files' => [['key' => validKey(), 'name' => 'a.jpg']],
    ])->assertStatus(422)->assertJsonValidationErrors('collection');
});

it('requires authentication on both upload endpoints', function (): void {
    app('auth')->forgetGuards();
    $this->app['auth']->guard()->logout();

    $album = Album::factory()->create();

    $this->postJson("/admin/albums/{$album->id}/uploads/sign", ['files' => []])
        ->assertUnauthorized();
});

it('ingests an uploaded object into the media collection', function (): void {
    Bus::fake([GenerateResponsiveImagesJob::class, PerformConversionsJob::class]);
    fakeS3();

    $album = Album::factory()->create();
    $key = validKey();
    Storage::disk('s3')->put($key, UploadedFile::fake()->image('shot.jpg', 800, 600)->getContent());

    (new IngestUploadedMedia($album->id, $key, 'shot.jpg', 'photos', 800, 600))->handle();

    $media = $album->refresh()->getMedia('photos');

    expect($media)->toHaveCount(1)
        ->and($media->first()->file_name)->toBe('shot.jpg')
        ->and($media->first()->name)->toBe('shot')
        ->and($media->first()->getCustomProperty('width'))->toBe(800)
        ->and($media->first()->getCustomProperty('height'))->toBe(600);

    // The media library removes the staged object once it has been copied across.
    Storage::disk('s3')->assertMissing($key);
});

it('ingests into the previews collection when asked', function (): void {
    Bus::fake([GenerateResponsiveImagesJob::class, PerformConversionsJob::class]);
    fakeS3();

    $album = Album::factory()->create();
    $key = validKey();
    Storage::disk('s3')->put($key, UploadedFile::fake()->image('p.jpg', 100, 100)->getContent());

    (new IngestUploadedMedia($album->id, $key, 'p.jpg', 'previews', 100, 100))->handle();

    expect($album->refresh()->getMedia('previews'))->toHaveCount(1)
        ->and($album->getMedia('photos'))->toHaveCount(0);
});

it('replaces an existing photo with the same filename', function (): void {
    Bus::fake([GenerateResponsiveImagesJob::class, PerformConversionsJob::class]);
    fakeS3();

    $album = Album::factory()->create();

    $first = validKey();
    Storage::disk('s3')->put($first, UploadedFile::fake()->image('shot.jpg', 800, 600)->getContent());
    (new IngestUploadedMedia($album->id, $first, 'shot.jpg', 'photos', 800, 600))->handle();
    $originalId = $album->refresh()->getMedia('photos')->first()->id;

    $second = validKey();
    Storage::disk('s3')->put($second, UploadedFile::fake()->image('shot.jpg', 400, 300)->getContent());
    (new IngestUploadedMedia($album->id, $second, 'shot.jpg', 'photos', 400, 300))->handle();

    $media = $album->refresh()->getMedia('photos');

    expect($media)->toHaveCount(1)
        ->and($media->first()->id)->not->toBe($originalId)
        ->and($media->first()->getCustomProperty('width'))->toBe(400);
});

it('moves featured status onto the replacement photo', function (): void {
    Bus::fake([GenerateResponsiveImagesJob::class, PerformConversionsJob::class]);
    fakeS3();

    $album = Album::factory()->create();

    $first = validKey();
    Storage::disk('s3')->put($first, UploadedFile::fake()->image('shot.jpg', 800, 600)->getContent());
    (new IngestUploadedMedia($album->id, $first, 'shot.jpg', 'photos', 800, 600))->handle();
    $featured = \App\Models\FeaturedPhoto::query()->create([
        'media_id' => $album->refresh()->getMedia('photos')->first()->id,
    ]);

    $second = validKey();
    Storage::disk('s3')->put($second, UploadedFile::fake()->image('shot.jpg', 400, 300)->getContent());
    (new IngestUploadedMedia($album->id, $second, 'shot.jpg', 'photos', 400, 300))->handle();

    expect($featured->refresh()->media_id)
        ->toBe($album->refresh()->getMedia('photos')->first()->id);
});

it('leaves same-named files in other collections alone', function (): void {
    Bus::fake([GenerateResponsiveImagesJob::class, PerformConversionsJob::class]);
    fakeS3();

    $album = Album::factory()->create();

    $preview = validKey();
    Storage::disk('s3')->put($preview, UploadedFile::fake()->image('shot.jpg', 100, 100)->getContent());
    (new IngestUploadedMedia($album->id, $preview, 'shot.jpg', 'previews', 100, 100))->handle();

    $photo = validKey();
    Storage::disk('s3')->put($photo, UploadedFile::fake()->image('shot.jpg', 800, 600)->getContent());
    (new IngestUploadedMedia($album->id, $photo, 'shot.jpg', 'photos', 800, 600))->handle();

    expect($album->refresh()->getMedia('previews'))->toHaveCount(1)
        ->and($album->getMedia('photos'))->toHaveCount(1);
});

it('discards the staged object when the album has been deleted', function (): void {
    fakeS3();

    $album = Album::factory()->create();
    $key = validKey();
    Storage::disk('s3')->put($key, 'bytes');
    $albumId = $album->id;
    $album->delete();

    (new IngestUploadedMedia($albumId, $key, 'gone.jpg', 'photos', 10, 10))->handle();

    Storage::disk('s3')->assertMissing($key);
});
