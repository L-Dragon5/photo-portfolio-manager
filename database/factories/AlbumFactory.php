<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Album;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Album>
 */
class AlbumFactory extends Factory
{
    protected $model = Album::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => null,
            'name' => $this->faker->words(3, true),
            'url_alias' => Str::random(10),
            'date_taken' => $this->faker->date(),
            'is_press' => false,
            'is_public' => true,
        ];
    }
}
