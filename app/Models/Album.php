<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Album extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'album_id',
        'cover_image',
        'url_alias',
    ];

    public function parentAlbum() {
        return $this->belongsTo(Album::class, 'album_id');
    }

    public function albums() {
        return $this->hasMany(Album::class)->orderBy('name');
    }

    public function photos() {
        return $this->hasMany(Photo::class)->orderBy('id');
    }

    protected static function booted() {
        static::deleting(function ($album) {
            if ($album->cover_image !== 'placeholder.webp') {
                Storage::disk('public')->delete($album->cover_image);

                Storage::disk('public')->deleteDirectory($album->id);
                Storage::disk('public')->deleteDirectory('thumbnails/' . $album->id);
                Storage::disk('public')->deleteDirectory('thumbnails/lazy/' . $album->id);
            }
        });
    }
}
