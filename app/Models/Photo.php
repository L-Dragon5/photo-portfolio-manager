<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;
use Jenssegers\Mongodb\Eloquent\Model;

class Photo extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $keyType = 'int';
    protected $fillable = [
        'album_id',
        'location',
        'is_landscape',
    ];

    public function album()
    {
        return $this->belongsTo(Album::class);
    }

    protected static function booted()
    {
        static::retrieved(function ($photo) {
            // Set thumbnail paths.
            $photo->thumbnail = str_replace('jpg', 'webp', Storage::url('thumbnails/' . $photo->location));
            $photo->lazy_thumbnail = str_replace('jpg', 'webp', Storage::url('thumbnails/lazy/' . $photo->location));

            // Set URL path of image.
            $photo->location = Storage::url($photo->location);
        });

        static::created(function ($photo) {
            // Create low-quality thumbnail placeholders.
            $img = \Image::make(Storage::get($photo->location));

            // Thumbnail Creation
            $path = 'thumbnails/' . str_replace('jpg', 'webp', $photo->location);
            $thumbnail = $img->resize(1000, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })->encode('webp');
            Storage::put($path, $thumbnail->__toString());

            // Lazy Thumbnail Creation
            $path = 'thumbnails/lazy/' . str_replace('jpg', 'webp', $photo->location);
            $lazy_thumbnail = $img->resize(20, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })->encode('webp', 10);
            Storage::put($path, $lazy_thumbnail->__toString());
        });

        static::deleting(function ($photo) {
            Storage::delete($photo->location);
            Storage::delete('thumbnails/' . $photo->location);
            Storage::delete('thumbnails/lazy/' . $photo->location);
        });
    }
}
