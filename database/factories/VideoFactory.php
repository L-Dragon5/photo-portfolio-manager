<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Video;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Video>
 */
class VideoFactory extends Factory
{
    protected $model = Video::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'album_id' => null,
            'youtube_id' => Str::random(11),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->sentence(),
            'url_alias' => Str::random(10),
            'date_taken' => $this->faker->date(),
            'is_public' => true,
        ];
    }

    public function private(): static
    {
        return $this->state(fn (): array => ['is_public' => false]);
    }
}
