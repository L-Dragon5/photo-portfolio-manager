<?php

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
            get: function () {
                $imageInfo = [
                    'id' => $this->id,
                    'title' => $this->name,
                    'src' => $this->getUrl(),
                    'height' => $this->getCustomProperty('height'),
                    'width' => $this->getCustomProperty('width'),
                    'srcSet' => [],
                    'download' => $this->getUrl(),
                ];

                $responsiveImages = $this->responsiveImages();
                $responsiveSrcSet = $responsiveImages->files->map(function ($ri) {
                    return [
                        'src' => $ri->url(),
                        'width' => $ri->width(),
                        'height' => $ri->height(),
                    ];
                });
                $responsiveSrcSet[] = [
                    'src' => $responsiveImages->getPlaceholderSvg(),
                    'width' => 32,
                    'height' => 32,
                ];
                $imageInfo['srcSet'] = $responsiveSrcSet;

                return $imageInfo;
            },
        );
    }
}
