<?php

declare(strict_types=1);

namespace App\Support;

class YouTube
{
    /**
     * Pull the 11-character video ID out of any YouTube URL form, or accept a
     * bare ID. Returns null when the input is not a YouTube video reference.
     */
    public static function idFromUrl(string $input): ?string
    {
        $input = trim($input);

        if ($input === '') {
            return null;
        }

        if (self::isId($input)) {
            return $input;
        }

        $url = str_starts_with($input, 'http://') || str_starts_with($input, 'https://')
            ? $input
            : 'https://' . $input;

        $parts = parse_url($url);

        if ($parts === false || !isset($parts['host'])) {
            return null;
        }

        $host = strtolower($parts['host']);
        $host = str_starts_with($host, 'www.') ? substr($host, 4) : $host;
        $host = str_starts_with($host, 'm.') ? substr($host, 2) : $host;

        $allowedHosts = ['youtube.com', 'youtube-nocookie.com', 'youtu.be', 'music.youtube.com'];

        if (!in_array($host, $allowedHosts, true)) {
            return null;
        }

        $path = trim($parts['path'] ?? '', '/');

        if ($host === 'youtu.be') {
            $candidate = explode('/', $path)[0] ?? '';

            return self::isId($candidate) ? $candidate : null;
        }

        parse_str($parts['query'] ?? '', $query);

        if (isset($query['v']) && is_string($query['v']) && self::isId($query['v'])) {
            return $query['v'];
        }

        foreach (['embed', 'shorts', 'v', 'live'] as $prefix) {
            if (str_starts_with($path, $prefix . '/')) {
                $candidate = explode('/', substr($path, strlen($prefix) + 1))[0] ?? '';

                return self::isId($candidate) ? $candidate : null;
            }
        }

        return null;
    }

    public static function thumbnailUrl(string $id): string
    {
        return "https://img.youtube.com/vi/{$id}/hqdefault.jpg";
    }

    public static function embedUrl(string $id): string
    {
        return "https://www.youtube-nocookie.com/embed/{$id}";
    }

    public static function watchUrl(string $id): string
    {
        return "https://www.youtube.com/watch?v={$id}";
    }

    private static function isId(string $candidate): bool
    {
        return preg_match('/^[A-Za-z0-9_-]{11}$/', $candidate) === 1;
    }
}
