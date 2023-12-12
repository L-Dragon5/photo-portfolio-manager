<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cosplayer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'instagram',
        'twitter',
    ];

    public function albums()
    {
        return $this->belongsToMany(Album::class, 'albums_cosplayers', 'cosplayer_id', 'album_id')->withTimestamps()->orderBy('name');
    }
}
