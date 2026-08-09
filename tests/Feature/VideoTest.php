<?php

declare(strict_types=1);

use App\Models\Album;
use App\Models\User;
use App\Models\Video;

it('requires authentication for the admin video list', function (): void {
    $this->get('/admin/videos')->assertUnauthorized();
});

it('lists videos in the admin panel', function (): void {
    $this->actingAs(User::factory()->create());
    $video = Video::factory()->create(['title' => 'Behind the scenes']);

    $this->get('/admin/videos')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Videos')
            ->has('videos', 1)
            ->where('videos.0.id', $video->id)
            ->where('videos.0.title', 'Behind the scenes')
        );
});

it('stores a video from a pasted watch url', function (): void {
    $this->actingAs(User::factory()->create());

    $this->post('/admin/videos', [
        'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
        'title' => 'A video',
        'is_public' => true,
    ])->assertRedirect('/admin/videos');

    $video = Video::query()->sole();

    expect($video->youtube_id)->toBe('dQw4w9WgXcQ')
        ->and($video->album_id)->toBeNull()
        ->and($video->embed_url)->toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
        ->and($video->thumbnail_url)->toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
});

it('rejects a url that is not a youtube video', function (): void {
    $this->actingAs(User::factory()->create());

    $this->post('/admin/videos', [
        'url' => 'https://vimeo.com/123456789',
        'title' => 'A video',
    ])->assertSessionHasErrors('url');

    expect(Video::query()->count())->toBe(0);
});

it('rejects an album that does not exist', function (): void {
    $this->actingAs(User::factory()->create());

    $this->post('/admin/videos', [
        'url' => 'https://youtu.be/dQw4w9WgXcQ',
        'title' => 'A video',
        'album_id' => 9999,
    ])->assertSessionHasErrors('album_id');
});

it('updates a video and re-parses the url', function (): void {
    $this->actingAs(User::factory()->create());
    $video = Video::factory()->create(['youtube_id' => 'aaaaaaaaaaa']);

    $this->put("/admin/videos/{$video->id}", [
        'url' => 'https://youtu.be/dQw4w9WgXcQ',
        'title' => 'Renamed',
    ])->assertRedirect('/admin/videos');

    expect($video->refresh()->youtube_id)->toBe('dQw4w9WgXcQ')
        ->and($video->title)->toBe('Renamed');
});

it('deletes a video', function (): void {
    $this->actingAs(User::factory()->create());
    $video = Video::factory()->create();

    $this->delete("/admin/videos/{$video->id}")->assertRedirect('/admin/videos');

    expect(Video::query()->count())->toBe(0);
});

it('removes an album\'s videos when the album is deleted', function (): void {
    $album = Album::factory()->create();
    Video::factory()->create(['album_id' => $album->id]);

    $album->delete();

    expect(Video::query()->count())->toBe(0);
});

it('shows only public standalone videos on the public page', function (): void {
    $album = Album::factory()->create();

    $standalone = Video::factory()->create(['title' => 'Standalone']);
    Video::factory()->private()->create(['title' => 'Hidden']);
    Video::factory()->create(['title' => 'In an album', 'album_id' => $album->id]);

    $this->get('/videos')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/Videos')
            ->has('videos', 1)
            ->where('videos.0.id', $standalone->id)
        );
});

it('includes public album videos on the album page', function (): void {
    $album = Album::factory()->create(['url_alias' => 'my-shoot', 'event_id' => null]);

    $shown = Video::factory()->create(['album_id' => $album->id, 'title' => 'Shown']);
    Video::factory()->private()->create(['album_id' => $album->id, 'title' => 'Hidden']);

    $this->get('/on-location/my-shoot')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/Album')
            ->has('album.videos', 1)
            ->where('album.videos.0.id', $shown->id)
        );
});
