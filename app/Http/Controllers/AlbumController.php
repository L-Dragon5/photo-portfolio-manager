<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlbumImagesRequest;
use App\Http\Requests\StoreAlbumRequest;
use App\Http\Requests\UpdateAlbumRequest;
use App\Models\Album;
use App\Models\Event;
use App\Models\Photo;
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
        $albums = Album::with(['relatedPhotos', 'event'])->orderBy('date_taken', 'DESC')->get();
        $events = Event::orderBy('name', 'ASC')->get();

        return Inertia::render('Admin/Index', [
            'albums' => $albums,
            'events' => $events,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(StoreAlbumRequest $request)
    {
        $validated = $request->validated();

        // Check if custom url alias is set. If not, make one.
        if (empty($validated['url_alias'])) {
            $validated['url_alias'] = $this->nameToUrlAlias($validated['name']);
        }

        Album::create([...$validated]);

        return to_route('admin-base');
    }

    public function storePreviews(StoreAlbumImagesRequest $request, Album $album)
    {
        foreach ($request->validated()['images'] as $preview) {
            [$width, $height] = $this->getDimensions($preview);
            $dateTaken = isset($exifData['DateTimeOriginal']) ? strtotime($exifData['DateTimeOriginal']) : null;

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

    public function storePhotos(StoreAlbumImagesRequest $request, Album $album)
    {
        foreach ($request->validated()['images'] as $photo) {
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
    public function update(UpdateAlbumRequest $request, Album $album)
    {
        $album->update([...$request->validated()]);

        return to_route('admin-base');
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

    private function nameToUrlAlias($inputString)
    {
        return str_replace(' ', '-', str_replace('-', '', strtolower($inputString)));
    }

    private function getDimensions(UploadedFile $file): array
    {
        try {
            $image = Image::load($file->getPathname());

            return [$image->getWidth(), $image->getHeight()];
        } catch (\Throwable $e) {
            return [null, null];
        }
    }
}
