<?php

declare(strict_types=1);

use App\Support\YouTube;

it('extracts the video id from every url form', function (string $input): void {
    expect(YouTube::idFromUrl($input))->toBe('dQw4w9WgXcQ');
})->with([
    'watch' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'watch without www' => 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    'watch with extra params' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PLabc',
    'watch with leading param' => 'https://www.youtube.com/watch?app=desktop&v=dQw4w9WgXcQ',
    'short link' => 'https://youtu.be/dQw4w9WgXcQ',
    'short link with param' => 'https://youtu.be/dQw4w9WgXcQ?t=30',
    'embed' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'nocookie embed' => 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    'shorts' => 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'live' => 'https://www.youtube.com/live/dQw4w9WgXcQ',
    'legacy /v/' => 'https://www.youtube.com/v/dQw4w9WgXcQ',
    'mobile' => 'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'music' => 'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
    'no scheme' => 'youtube.com/watch?v=dQw4w9WgXcQ',
    'http' => 'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'surrounding whitespace' => '  https://youtu.be/dQw4w9WgXcQ  ',
    'bare id' => 'dQw4w9WgXcQ',
]);

it('returns null for anything that is not a youtube video', function (string $input): void {
    expect(YouTube::idFromUrl($input))->toBeNull();
})->with([
    'empty' => '',
    'whitespace' => '   ',
    'another host' => 'https://vimeo.com/123456789',
    'lookalike host' => 'https://notyoutube.com/watch?v=dQw4w9WgXcQ',
    'youtube channel' => 'https://www.youtube.com/@someone',
    'youtube home' => 'https://www.youtube.com',
    'id too short' => 'https://youtu.be/short',
    'id too long' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQextra',
    'illegal id characters' => 'https://youtu.be/dQw4w9WgX!Q',
    'plain sentence' => 'not a url at all',
]);

it('builds thumbnail, embed and watch urls from an id', function (): void {
    expect(YouTube::thumbnailUrl('dQw4w9WgXcQ'))
        ->toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
        ->and(YouTube::embedUrl('dQw4w9WgXcQ'))
        ->toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
        ->and(YouTube::watchUrl('dQw4w9WgXcQ'))
        ->toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
});

it('round-trips a generated embed url back to the same id', function (): void {
    expect(YouTube::idFromUrl(YouTube::embedUrl('dQw4w9WgXcQ')))->toBe('dQw4w9WgXcQ');
});
