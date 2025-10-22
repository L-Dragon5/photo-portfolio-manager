<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'name',
        'url_alias',
        'start_date',
        'end_date',
    ];

    public function albums()
    {
        return $this->hasMany(Album::class)->orderBy('name');
    }
}
