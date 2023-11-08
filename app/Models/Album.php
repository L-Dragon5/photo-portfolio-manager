<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Album extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'event_id',
        'album_id',
        'notes',
        'cover_image',
        'url_alias',
        'password',
        'date_taken',
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

    public function photos()
    {
        return $this->hasMany(Photo::class)->orderBy('_id');
    }

    protected static function booted()
    {
        static::deleting(function ($album) {
            if ($album->cover_image !== 'placeholder.webp') {
                Storage::delete($album->cover_image);

                Storage::deleteDirectory($album->_id);
                Storage::deleteDirectory('thumbnails/' . $album->_id);
                Storage::deleteDirectory('thumbnails/lazy/' . $album->_id);
            }
        });
    }
}
