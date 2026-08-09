<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\YouTube;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Video extends Model
{
    use HasFactory;
    protected $fillable = [
        'album_id',
        'youtube_id',
        'title',
        'description',
        'url_alias',
        'date_taken',
        'is_public',
        'order_column',
    ];
    protected $appends = ['thumbnail_url', 'embed_url', 'watch_url'];

    protected function casts(): array
    {
        return [
            'date_taken' => 'date',
            'is_public' => 'boolean',
        ];
    }

    public function album(): BelongsTo
    {
        return $this->belongsTo(Album::class);
    }

    protected function thumbnailUrl(): Attribute
    {
        return Attribute::make(get: fn (): string => YouTube::thumbnailUrl($this->youtube_id));
    }

    protected function embedUrl(): Attribute
    {
        return Attribute::make(get: fn (): string => YouTube::embedUrl($this->youtube_id));
    }

    protected function watchUrl(): Attribute
    {
        return Attribute::make(get: fn (): string => YouTube::watchUrl($this->youtube_id));
    }
}
