<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;
use Jenssegers\Mongodb\Eloquent\Model;

class Album extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $keyType = 'int';
    protected $fillable = [
        'name',
        'album_id',
        'cover_image',
        'url_alias',
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
