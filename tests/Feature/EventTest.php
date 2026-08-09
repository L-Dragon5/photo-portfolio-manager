<?php

declare(strict_types=1);

use App\Models\Event;
use App\Models\User;

beforeEach(function (): void {
    $this->actingAs(User::factory()->create());
});

function makeEvent(array $attributes = []): Event
{
    return Event::query()->create([
        'name' => 'Anime Expo',
        'url_alias' => 'anime-expo',
        'start_date' => '2026-07-01',
        'end_date' => '2026-07-04',
        ...$attributes,
    ]);
}

/** Same blank-alias defect as the album edit form. */
it('saves the edit form when the url alias is left blank', function (): void {
    $event = makeEvent();

    $this->put("/admin/events/{$event->id}", [
        'name' => 'Anime Expo 2027',
        'url_alias' => '',
        'start_date' => '2027-07-01',
        'end_date' => '2027-07-04',
    ])->assertSessionHasNoErrors()->assertRedirect('/admin/events');

    expect($event->refresh()->name)->toBe('Anime Expo 2027');
});

it('regenerates the url alias from the name when left blank', function (): void {
    $event = makeEvent();

    $this->put("/admin/events/{$event->id}", [
        'name' => 'Anime Expo 2027',
        'url_alias' => '',
    ])->assertSessionHasNoErrors();

    expect($event->refresh()->url_alias)->toBe('anime-expo-2027');
});

it('keeps an explicit url alias untouched', function (): void {
    $event = makeEvent();

    $this->put("/admin/events/{$event->id}", [
        'name' => 'Anime Expo 2027',
        'url_alias' => 'ax-2027',
    ])->assertSessionHasNoErrors();

    expect($event->refresh()->url_alias)->toBe('ax-2027');
});
