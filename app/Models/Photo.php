<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Photo extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'album_id',
        'location',
        'is_landscape',
    ];

    public function album() {
        return $this->belongsTo(Album::class);
    }

    protected static function booted() {
        static::retrieved(function ($photo) {
            // Set thumbnail paths.
            $photo->thumbnail = '/storage/thumbnails/' . str_replace('jpg', 'webp', $photo->location);
            $photo->lazy_thumbnail = '/storage/thumbnails/lazy/' . str_replace('jpg', 'webp', $photo->location);
        });

        static::created(function ($photo) {
            // Create low-quality thumbnail placeholders.
            $img = \Image::make(Storage::disk('public')->get($photo->location));

            // Thumbnail Creation
            $path = 'thumbnails/' . str_replace('jpg', 'webp', $photo->location);
            $thumbnail = $img->resize(1000, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })->encode('webp');
            Storage::disk('public')->put($path, $thumbnail->__toString());

            // Lazy Thumbnail Creation
            $path = 'thumbnails/lazy/' . str_replace('jpg', 'webp', $photo->location);
            $lazy_thumbnail = $img->resize(20, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })->encode('webp', 10);
            Storage::disk('public')->put($path, $lazy_thumbnail->__toString());
        });

        static::deleting(function ($photo) {
            Storage::disk('public')->delete($photo->location);
            Storage::disk('public')->delete('thumbnails/' . $photo->location);
            Storage::disk('public')->delete('thumbnails/lazy/' . $photo->location);
        });
    }
}
