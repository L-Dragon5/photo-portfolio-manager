<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use App\Models\Album;
use App\Models\Video;
use App\Support\YouTube;
use Inertia\Inertia;

class VideoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): \Inertia\Response
    {
        $videos = Video::query()
            ->with('album:id,name')
            ->orderByRaw('date_taken IS NULL, date_taken DESC')
            ->orderBy('title', 'ASC')
            ->get();

        $albums = Album::query()->orderBy('name', 'ASC')->get(['id', 'name']);

        return Inertia::render('Admin/Videos', [
            'videos' => $videos,
            'albums' => $albums,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVideoRequest $storeVideoRequest): \Illuminate\Http\RedirectResponse
    {
        Video::query()->create($this->attributes($storeVideoRequest->validated()));

        return to_route('videos.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVideoRequest $updateVideoRequest, Video $video): \Illuminate\Http\RedirectResponse
    {
        $video->update($this->attributes($updateVideoRequest->validated()));

        return to_route('videos.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Video $video): \Illuminate\Http\RedirectResponse
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
