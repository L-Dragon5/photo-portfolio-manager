<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use App\Models\Album;
use App\Models\Video;
use App\Support\YouTube;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VideoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $videos = Video::query()
            ->with('album:id,name')
            ->orderByRaw('date_taken IS NULL, date_taken DESC')
            ->orderBy('title', 'ASC')
            ->get();

        /**
         * Only the album Select needs this list. Serialising the appended
         * `cover_image` would fire a media query per album, so hide it.
         */
        $albums = Album::query()->orderBy('name', 'ASC')->get(['id', 'name'])->makeHidden('cover_image');

        return Inertia::render('Admin/Videos', [
            'videos' => $videos,
            'albums' => $albums,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVideoRequest $storeVideoRequest): RedirectResponse
    {
        Video::query()->create($this->attributes($storeVideoRequest->validated()));

        return to_route('videos.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVideoRequest $updateVideoRequest, Video $video): RedirectResponse
    {
        $video->update($this->attributes($updateVideoRequest->validated()));

        return to_route('videos.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Video $video): RedirectResponse
    {
        $video->delete();

        return to_route('videos.index');
    }

    /**
     * Swap the pasted URL for the parsed video ID.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function attributes(array $validated): array
    {
        if (array_key_exists('url', $validated)) {
            $validated['youtube_id'] = YouTube::idFromUrl((string) $validated['url']);
            unset($validated['url']);
        }

        return $validated;
    }
}
