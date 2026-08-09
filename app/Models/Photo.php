<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;

class Photo extends BaseMedia
{
    protected $appends = ['html'];

    /**
     * The frontend reads `html` and nothing else off a photo. These columns are
     * still available to the accessors server-side; they just stop riding along
     * in every JSON response. `responsive_images` alone carries the source URLs
     * plus a base64 placeholder, roughly 2KB per photo.
     */
    protected $hidden = [
        'responsive_images',
        'manipulations',
        'generated_conversions',
        'custom_properties',
        'conversions_disk',
        'model_type',
        'uuid',
        'order_column',
    ];

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
