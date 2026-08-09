<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlbumRequest;
use App\Http\Requests\UpdateAlbumRequest;
use App\Models\Album;
use App\Models\Cosplayer;
use App\Models\Event;
use App\Models\FeaturedPhoto;
use App\Models\Photo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class AlbumController extends Controller
{
    /**
     * Display listing on admin page.
     *
     * @return Response
     */
    public function index()
    {
        $albums = Album::with([
            /**
             * The culled-previews popover shows filenames only. Loading whole
             * Photo rows dragged the `responsive_images` blob and the appended
             * `html` srcSet along for every selected photo in every album.
             */
            'relatedPhotos' => fn ($q) => $q->select('media.id', 'media.name'),
            'event',
            'cosplayers',
        ])
            ->withCount([
                'media as photos_count' => fn ($q) => $q->where('collection_name', 'photos'),
                'media as previews_count' => fn ($q) => $q->where('collection_name', 'previews'),
            ])
            ->orderBy('date_taken', 'DESC')
            ->paginate(25);

        /**
         * This page never renders a cover image, and the appended accessor
         * costs one media query per album.
         */
        $albums->getCollection()->each(function (Album $album): void {
            $album->makeHidden('cover_image');
            $album->relatedPhotos->each->makeHidden('html');
        });

        $events = Event::query()->orderBy('name', 'ASC')->get();

        return Inertia::render('Admin/Index', [
            'albums' => $albums,
            'events' => $events,
        ]);
    }

    public function showMedia(Album $album): JsonResponse
    {
        $album->append(['photos', 'previews']);

        return response()->json([
            'photos' => $album->photos,
            'previews' => $album->previews,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(StoreAlbumRequest $storeAlbumRequest)
    {
        $validated = $storeAlbumRequest->validated();

        // Check if custom url alias is set. If not, make one.
        if (empty($validated['url_alias'])) {
            $validated['url_alias'] = $this->nameToUrlAlias($validated['name']);
        }

        Album::query()->create([...$validated]);

        return to_route('admin-base');
    }

    /**
     * Update the specified resource in storage.
     *
     * @return Response
     */
    public function update(UpdateAlbumRequest $updateAlbumRequest, Album $album)
    {
        $validated = $updateAlbumRequest->validated();

        // The edit form invites a blank alias; derive one rather than storing null.
        if (array_key_exists('url_alias', $validated) && empty($validated['url_alias'])) {
            $validated['url_alias'] = $this->nameToUrlAlias($validated['name'] ?? $album->name);
        }

        $album->update([...$validated]);

        // back() rather than to_route() so the paginated admin list stays on
        // the page the album was edited from.
        return back();
    }

    public function updateAlbumCosplayerAdd(Request $request, Album $album)
    {
        $validated = $request->validate([
            'cosplayer_id' => ['required', 'numeric'],
            'character' => ['required', 'nullable', 'string'],
        ]);

        $album->cosplayers()->attach($validated['cosplayer_id'], ['character' => $validated['character']]);

        return back();
    }

    public function updateAlbumCosplayerRemove(Request $request, Album $album, Cosplayer $cosplayer)
    {
        $album->cosplayers()->detach($cosplayer->id);

        return back();
    }

    public function updateCoverImage(Request $request, Album $album): RedirectResponse
    {
        $validated = $request->validate([
            'cover_image_id' => ['required', 'numeric'],
        ]);

        $album->update($validated);

        return back();
    }

    public function updateFeaturedPhoto(Request $request, Photo $photo): void
    {
        $fp = FeaturedPhoto::query()->where('media_id', $photo->id)->first();

        if (empty($fp)) {
            FeaturedPhoto::query()->create([
                'media_id' => $photo->id,
            ]);
        } else {
            $fp->delete();
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return Response
     */
    public function destroy(Album $album)
    {
        $album->delete();

        // back() rather than to_route() so the paginated admin list stays on
        // the page the album was deleted from.
        return back();
    }

    public function destroyImage(Photo $photo)
    {
        $fp = FeaturedPhoto::query()->where('media_id', $photo->id)->first();
        if (!empty($fp)) {
            $fp->delete();
        }

        $photo->delete();

        return to_route('admin-base');
    }

    public function destroyPreviews(Album $album)
    {
        $album->clearMediaCollection('previews');
        $album->password = null;
        $album->save();

        // back() rather than to_route() so the paginated admin list stays on
        // the page the previews were purged from.
        return back();
    }

    private function nameToUrlAlias($inputString): string
    {
        return str_replace(' ', '-', str_replace('-', '', strtolower((string) $inputString)));
    }
}
