<?php

declare(strict_types=1);

use App\Models\Album;
use App\Models\User;

beforeEach(function (): void {
    $this->actingAs(User::factory()->create());
});

/**
 * EditAlbum.jsx submits every field on every save, and blank text inputs arrive
 * as null because of ConvertEmptyStringsToNull. The URL alias field is
 * explicitly labelled "leave blank to generate one".
 */
it('saves the edit form when the url alias is left blank', function (): void {
    $album = Album::factory()->create(['url_alias' => 'existing-alias']);

    $this->put("/admin/albums/{$album->id}", [
        'name' => 'Renamed Album',
        'event_id' => '',
        'notes' => '',
        'url_alias' => '',
        'date_taken' => '2026-01-01',
        'password' => '',
        'is_press' => false,
        'is_public' => true,
    ])->assertSessionHasNoErrors()->assertRedirect('/admin');

    expect($album->refresh()->name)->toBe('Renamed Album');
});

it('regenerates the url alias from the name when left blank', function (): void {
    $album = Album::factory()->create(['url_alias' => 'old-alias']);

    $this->put("/admin/albums/{$album->id}", [
        'name' => 'Anime Expo Day Two',
        'url_alias' => '',
    ])->assertSessionHasNoErrors();

    expect($album->refresh()->url_alias)->toBe('anime-expo-day-two');
});

it('keeps an explicit url alias untouched', function (): void {
    $album = Album::factory()->create(['url_alias' => 'old-alias']);

    $this->put("/admin/albums/{$album->id}", [
        'name' => 'Anime Expo Day Two',
        'url_alias' => 'custom-alias',
    ])->assertSessionHasNoErrors();

    expect($album->refresh()->url_alias)->toBe('custom-alias');
});

it('never leaves an album without a url alias', function (): void {
    $album = Album::factory()->create(['url_alias' => 'old-alias']);

    $this->put("/admin/albums/{$album->id}", ['url_alias' => '']);

    expect($album->refresh()->url_alias)->not->toBeNull()->not->toBe('');
});

it('clears the event when the select is emptied', function (): void {
    $event = \App\Models\Event::query()->create([
        'name' => 'Con',
        'url_alias' => 'con',
        'start_date' => '2026-01-01',
        'end_date' => '2026-01-02',
    ]);
    $album = Album::factory()->create(['event_id' => $event->id]);

    $this->put("/admin/albums/{$album->id}", [
        'name' => 'Still Named',
        'event_id' => '',
        'url_alias' => 'kept',
    ])->assertSessionHasNoErrors();

    expect($album->refresh()->event_id)->toBeNull();
});

it('still rejects a blank name', function (): void {
    $album = Album::factory()->create();

    $this->put("/admin/albums/{$album->id}", ['name' => ''])
        ->assertSessionHasErrors('name');
});
