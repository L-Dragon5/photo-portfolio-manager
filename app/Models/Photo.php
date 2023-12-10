<?php

namespace App\Models;

use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;

class Photo extends BaseMedia
{
    protected $fillable = [
        'album_id',
        'location',
        'is_landscape',
        'is_selected',
        'is_preview',
        'is_featured',
    ];

    protected static function booted()
    {
        static::retrieved(function ($photo) {
            $dom = new \DOMDocument;
            $dom->loadHTML($photo->toHtml());
            $attr = [];
            foreach ($dom->getElementsByTagName('img') as $tag) {
                foreach ($tag->attributes as $attribName => $attribNodeVal)
                {
                    $attr[$attribName] = $tag->getAttribute($attribName);
                }
            }

            $attr['srcSet'] = $attr['srcset'];
            $attr['width'] .= 'px';
            $attr['height'] .= 'px';
            unset($attr['onload']);
            unset($attr['srcset']);
            unset($attr['sizes']);
            
            $photo->html = $attr;
            return $photo;
        });
    }
}
