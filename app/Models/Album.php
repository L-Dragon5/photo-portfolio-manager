<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Casts\Attribute;

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

    public function cosplayers()
    {
        return $this->belongsToMany(Cosplayer::class);
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
                if (!is_null($this->cover_image_id)) {
                    $coverPhoto = $this->getMedia('photos')->where('id', $this->cover_image_id)->first();
                }

                if (is_null($coverPhoto)) {
                    $media = $this->getFirstMedia('photos');
                    if (!is_null($media)) {
                        $coverPhoto = $media;
                    } else {
                        $coverPhoto = [
                            'html' => [
                                'src' => 'https://placehold.co/600x400',
                                'width' => 600,
                                'height' => 400,
                            ]
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
            get: fn () => $this->getMedia('photos'),
        );
    }

    protected function previews(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getMedia('previews'),
        );
    }
}
