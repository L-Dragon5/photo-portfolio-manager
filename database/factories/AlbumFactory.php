<?php

namespace Database\Factories;

use App\Models\Album;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AlbumFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Album::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'album_id' => $this->faker->numberBetween(0, 3),
            'name' => $this->faker->name,
            'cover_image' => 'placeholder.jpg',
            'url_alias' => Str::random(10),
        ];
    }
}
