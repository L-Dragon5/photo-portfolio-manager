<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Album extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'name',
        'event_id',
        'notes',
        'cover_image_id',
        'url_alias',
        'password',
        'date_taken',
        'is_press',
        'is_public',
    ];

    protected $appends = ['cover_image', 'photos', 'previews'];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function cosplayers()
    {
        return $this->belongsToMany(Cosplayer::class, 'albums_cosplayers', 'album_id', 'cosplayer_id')->withPivot(['character'])->withTimestamps();
    }

    public function relatedPhotos()
    {
        return $this->belongsToMany(Photo::class, 'albums_media', 'album_id', 'media_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos')->withResponsiveImages();
        $this->addMediaCollection('previews')->withResponsiveImages();
    }

    protected function coverImage(): Attribute
    {
        return Attribute::make(
            get: function () {
                $coverPhoto = null;
                if (! is_null($this->cover_image_id)) {
                    $coverPhoto = $this->getMedia('photos')->where('id', $this->cover_image_id)->first();
                }

                if (is_null($coverPhoto)) {
                    $media = $this->getFirstMedia('photos');
                    if (! is_null($media)) {
                        $coverPhoto = $media;
                    } else {
                        $coverPhoto = [
                            'html' => [
                                'src' => 'https://placehold.co/600x400',
                                'width' => 600,
                                'height' => 400,
                            ],
                        ];
                    }
                }

                return $coverPhoto;
            },
        );
    }

    protected function photos(): Attribute
    {
        return Attribute::make(
            get: function () {
                $photos = $this->getMedia('photos');
                $sorted = $photos->sort(function (Photo $a, Photo $b) {
                    if (! $a->hasCustomProperty('date_taken')) {
                        return ! $b->hasCustomProperty('date_taken') ? 0 : 1;
                    }

                    if (! $b->hasCustomProperty('date_taken')) {
                        return -1;
                    }

                    if ($a->getCustomProperty('date_taken') === $b->getCustomProperty('date_taken')) {
                        return 0;
                    }

                    return $a->getCustomProperty('date_taken') < $b->getCustomProperty('date_taken') ? -1 : 1;
                });

                return $sorted->values()->all();
            },
        );
    }

    protected function previews(): Attribute
    {
        return Attribute::make(
            get: function () {
                $photos = $this->getMedia('previews');
                $sorted = $photos->sort(function (Photo $a, Photo $b) {
                    if (! $a->hasCustomProperty('date_taken')) {
                        return ! $b->hasCustomProperty('date_taken') ? 0 : 1;
                    }

                    if (! $b->hasCustomProperty('date_taken')) {
                        return -1;
                    }

                    if ($a->getCustomProperty('date_taken') === $b->getCustomProperty('date_taken')) {
                        return 0;
                    }

                    return $a->getCustomProperty('date_taken') < $b->getCustomProperty('date_taken') ? -1 : 1;
                });

                return $sorted->values()->all();
            },
        );
    }
}
