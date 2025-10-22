<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlbumImagesRequest;
use App\Http\Requests\StoreAlbumRequest;
use App\Http\Requests\UpdateAlbumRequest;
use App\Models\Album;
use App\Models\Cosplayer;
use App\Models\Event;
use App\Models\FeaturedPhoto;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Spatie\Image\Image;

class AlbumController extends Controller
{
    /**
     * Display listing on admin page.
     *
     * @return  \Illuminate\Http\Response
     */
    public function index()
    {
        $lengthAwarePaginator = Album::with(['relatedPhotos', 'event', 'cosplayers'])->orderBy('date_taken', 'DESC')->paginate(25);
        $events = \App\Models\Event::query()->orderBy('name', 'ASC')->get();

        return Inertia::render('Admin/Index', [
            'albums' => $lengthAwarePaginator,
            'events' => $events,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(StoreAlbumRequest $storeAlbumRequest)
    {
        $validated = $storeAlbumRequest->validated();

        // Check if custom url alias is set. If not, make one.
        if (empty($validated['url_alias'])) {
            $validated['url_alias'] = $this->nameToUrlAlias($validated['name']);
        }

        \App\Models\Album::query()->create([...$validated]);

        return to_route('admin-base');
    }

    public function storePreviews(StoreAlbumImagesRequest $storeAlbumImagesRequest, Album $album)
    {
        foreach ($storeAlbumImagesRequest->validated()['images'] as $preview) {
            [$width, $height] = $this->getDimensions($preview);
            $dateTaken = isset($exifData['DateTimeOriginal']) ? strtotime((string) $exifData['DateTimeOriginal']) : null;

            $album
                ->addMedia($preview)
                ->preservingOriginal()
                ->withCustomProperties([
                    'width' => $width,
                    'height' => $height,
                    'date_taken' => $dateTaken,
                ])
                ->toMediaCollection('previews');
        }

        return to_route('admin-base');
    }

    public function storePhotos(StoreAlbumImagesRequest $storeAlbumImagesRequest, Album $album)
    {
        foreach ($storeAlbumImagesRequest->validated()['images'] as $photo) {
            [$width, $height] = $this->getDimensions($photo);
            $exifData = exif_read_data($photo);
            $dateTaken = isset($exifData['DateTimeOriginal']) ? strtotime($exifData['DateTimeOriginal']) : null;

            $album
                ->addMedia($photo)
                ->preservingOriginal()
                ->withCustomProperties([
                    'width' => $width,
                    'height' => $height,
                    'date_taken' => $dateTaken,
                ])
                ->toMediaCollection('photos');
        }

        return to_route('admin-base');
    }

    /**
     * Update the specified resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateAlbumRequest $updateAlbumRequest, Album $album)
    {
        $album->update([...$updateAlbumRequest->validated()]);

        return to_route('admin-base');
    }

    public function updateAlbumCosplayerAdd(Request $request, Album $album)
    {
        $validated = $request->validate([
            'cosplayer_id' => ['required', 'numeric'],
            'character' => ['required', 'nullable', 'string'],
        ]);

        $album->cosplayers()->attach($validated['cosplayer_id'], ['character' => $validated['character']]);

        return to_route('admin-base');
    }

    public function updateAlbumCosplayerRemove(Request $request, Album $album, Cosplayer $cosplayer)
    {
        $album->cosplayers()->detach($cosplayer->id);

        return to_route('admin-base');
    }

    public function updateFeaturedPhoto(Request $request, Photo $photo): void
    {
        $fp = \App\Models\FeaturedPhoto::query()->where('media_id', $photo->id)->first();

        if (empty($fp)) {
            \App\Models\FeaturedPhoto::query()->create([
                'media_id' => $photo->id,
            ]);
        } else {
            $fp->delete();
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy(Album $album)
    {
        $album->delete();

        return to_route('admin-base');
    }

    public function destroyImage(Photo $photo)
    {
        $fp = \App\Models\FeaturedPhoto::query()->where('media_id', $photo->id)->first();
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

        return to_route('admin-base');
    }

    private function nameToUrlAlias($inputString): string
    {
        return str_replace(' ', '-', str_replace('-', '', strtolower((string) $inputString)));
    }

    private function getDimensions(UploadedFile $uploadedFile): array
    {
        try {
            $image = Image::load($uploadedFile->getPathname());

            return [$image->getWidth(), $image->getHeight()];
        } catch (\Throwable) {
            return [null, null];
        }
    }
}
