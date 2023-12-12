<?php

namespace App\Models;

use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Photo extends BaseMedia
{
    protected $fillable = [
        'album_id',
        'is_featured',
    ];
    protected $appends = ['html'];

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
