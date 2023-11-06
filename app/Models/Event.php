<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'name',
        'start_date',
        'end_date',
    ];

    public function albums()
    {
        return $this->hasMany(Album::class)->orderBy('name');
    }
}
