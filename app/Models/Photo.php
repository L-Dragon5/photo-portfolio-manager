<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;

class Photo extends BaseMedia
{
    protected $appends = ['html'];

    public function albums()
    {
        return $this->belongsToMany(Album::class, 'albums_media', 'media_id', 'album_id');
    }

    protected function html(): Attribute
    {
        return Attribute::make(
            get: function (): array {
                $imageInfo = [
                    'id' => $this->id,
                    'title' => $this->name,
                    'src' => $this->getUrl(),
                    'height' => $this->getCustomProperty('height'),
                    'width' => $this->getCustomProperty('width'),
                    'srcSet' => [],
                    'download' => $this->getUrl(),
                ];

                /**
                 * The base64 placeholder SVG used to be appended here as a 32w
                 * candidate. A browser never picks a 32w candidate for a real
                 * thumbnail, so it only inflated the JSON by ~1-3KB per photo.
                 */
                $imageInfo['srcSet'] = $this->responsiveImages()->files->map(fn ($ri): array => [
                    'src' => $ri->url(),
                    'width' => $ri->width(),
                    'height' => $ri->height(),
                ]);

                return $imageInfo;
            },
        );
    }
}
