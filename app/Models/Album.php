<?php

namespace App\Models;

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
        'album_id',
        'notes',
        'cover_image_id',
        'url_alias',
        'password',
        'date_taken',
        'is_press',
        'is_public',
    ];

    public function parentAlbum()
    {
        return $this->belongsTo(Album::class, 'album_id');
    }

    public function albums()
    {
        return $this->hasMany(Album::class)->orderBy('name');
    }

    public function cosplayers()
    {
        return $this->belongsToMany(Cosplayer::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('previews');
    }
}
