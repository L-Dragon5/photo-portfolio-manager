<?php

declare(strict_types=1);

use App\Models\Album;
use App\Models\Photo;

function makeAlbumWithPhotos(string $password, int $count = 3): array
{
    $album = Album::query()->create([
        'name' => 'Test Album',
        'url_alias' => 'test-album-' . uniqid(),
        'password' => $password,
    ]);

    $photos = collect(range(1, $count))->map(fn (int $i): Photo => Photo::query()->create([
        'model_type' => Album::class,
        'model_id' => $album->id,
        'uuid' => (string) \Illuminate\Support\Str::uuid(),
        'collection_name' => 'previews',
        'name' => "preview-{$i}",
        'file_name' => "preview-{$i}.jpg",
        'mime_type' => 'image/jpeg',
        'disk' => 'public',
        'conversions_disk' => 'public',
        'size' => 1000,
        'manipulations' => [],
        'custom_properties' => [],
        'generated_conversions' => [],
        'responsive_images' => [],
        'order_column' => $i,
    ]))->all();

    return [$album, $photos];
}

it('renders the culling page with the right password', function (): void {
    [$album] = makeAlbumWithPhotos('secret-pw');

    $this->get('/culling/secret-pw')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/Culling')
            ->where('password', 'secret-pw')
            ->where('album.id', $album->id)
        );
});

it('renders AlbumNotFound for a wrong password', function (): void {
    makeAlbumWithPhotos('correct-pw');

    $this->get('/culling/wrong-pw')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Public/AlbumNotFound'));
});

it('attaches a photo to the album when toggled selected', function (): void {
    [$album, $photos] = makeAlbumWithPhotos('pw1');
    $photo = $photos[0];

    $this->put("/culling/pw1/photos/{$photo->id}", ['selected' => true])
        ->assertRedirect();

    expect($album->relatedPhotos()->pluck('media_id')->all())->toContain($photo->id);
});

it('detaches a photo from the album when toggled unselected', function (): void {
    [$album, $photos] = makeAlbumWithPhotos('pw2');
    $photo = $photos[0];
    $album->relatedPhotos()->attach($photo->id);

    $this->put("/culling/pw2/photos/{$photo->id}", ['selected' => false])
        ->assertRedirect();

    expect($album->relatedPhotos()->pluck('media_id')->all())->not->toContain($photo->id);
});

it('returns 422 when toggling a photo that does not belong to the album', function (): void {
    [, $photos] = makeAlbumWithPhotos('pw3');
    [$other] = makeAlbumWithPhotos('pw3-other');
    $foreignPhoto = $photos[0];

    $this->put("/culling/pw3-other/photos/{$foreignPhoto->id}", ['selected' => true])
        ->assertStatus(422);

    expect($other->relatedPhotos()->pluck('media_id')->all())->not->toContain($foreignPhoto->id);
});

it('returns 404 when toggling with a wrong password', function (): void {
    [, $photos] = makeAlbumWithPhotos('right-pw');
    $photo = $photos[0];

    $this->put("/culling/wrong-pw/photos/{$photo->id}", ['selected' => true])
        ->assertNotFound();
});

it('preserves both selections when two different photos are toggled sequentially', function (): void {
    [$album, $photos] = makeAlbumWithPhotos('concurrent-pw', 4);

    $this->put("/culling/concurrent-pw/photos/{$photos[0]->id}", ['selected' => true]);
    $this->put("/culling/concurrent-pw/photos/{$photos[1]->id}", ['selected' => true]);

    $ids = $album->relatedPhotos()->pluck('media_id')->all();
    expect($ids)->toContain($photos[0]->id)->toContain($photos[1]->id);
});

it('marks the album culling as completed', function (): void {
    [$album] = makeAlbumWithPhotos('done-pw');

    $this->post('/culling/done-pw/complete', ['completed' => true])
        ->assertRedirect();

    expect($album->fresh()->culling_completed_at)->not->toBeNull();
});

it('clears the completed timestamp when undoing', function (): void {
    [$album] = makeAlbumWithPhotos('undo-pw');
    $album->update(['culling_completed_at' => now()]);

    $this->post('/culling/undo-pw/complete', ['completed' => false])
        ->assertRedirect();

    expect($album->fresh()->culling_completed_at)->toBeNull();
});
