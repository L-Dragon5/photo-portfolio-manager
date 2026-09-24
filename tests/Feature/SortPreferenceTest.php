<?php

declare(strict_types=1);

use App\Models\Event;

/**
 * Raw cookies on purpose: the page writes them with document.cookie, so this
 * also proves the names are excluded from encryption in bootstrap/app.php (otherwise decryption
 * fails, the cookie is dropped, and the default comes back).
 */
it('uses the remembered on-location sort when the url has none', function (): void {
    $this->withUnencryptedCookie('on_location_sort', 'name-asc')
        ->get('/on-location')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->where('sort', 'name-asc'));
});

it('uses the remembered event albums sort when the url has none', function (): void {
    Event::query()->create(['name' => 'Katsucon 2026', 'url_alias' => 'katsucon-2026']);

    $this->withUnencryptedCookie('event_albums_sort', 'date-desc')
        ->get('/events/katsucon-2026')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->where('sort', 'date-desc'));
});

it('lets an explicit sort in the url beat the remembered one', function (): void {
    $this->withUnencryptedCookie('on_location_sort', 'name-asc')
        ->get('/on-location?sort=date-asc')
        ->assertInertia(fn ($page) => $page->where('sort', 'date-asc'));
});

it('falls back to the page default for an unknown sort', function (string $url, string $cookie, string $expected): void {
    $this->withUnencryptedCookie($cookie, 'bogus')
        ->get($url)
        ->assertInertia(fn ($page) => $page->where('sort', $expected));
})->with([
    'on-location cookie' => ['/on-location', 'on_location_sort', 'date-desc'],
    'on-location query' => ['/on-location?sort=bogus', 'unused', 'date-desc'],
]);

it('uses the page default with nothing remembered', function (): void {
    $this->get('/on-location')->assertInertia(fn ($page) => $page->where('sort', 'date-desc'));
});
