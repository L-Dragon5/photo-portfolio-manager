<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
