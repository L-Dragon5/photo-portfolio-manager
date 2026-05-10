<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\RegisterPreviewUploadRequest;
use App\Http\Requests\SignPreviewUploadRequest;
use App\Http\Requests\StoreAlbumImagesRequest;
use App\Http\Requests\StoreAlbumRequest;
use App\Http\Requests\UpdateAlbumRequest;
use App\Models\Album;
use App\Models\Cosplayer;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Image\Image;
use Spatie\MediaLibrary\Support\PathGenerator\PathGeneratorFactory;

class AlbumController extends Controller
{
    /**
     * Display listing on admin page.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $albums = Album::with(['relatedPhotos', 'event', 'cosplayers'])
            ->withCount([
                'media as photos_count' => fn ($q) => $q->where('collection_name', 'photos'),
                'media as previews_count' => fn ($q) => $q->where('collection_name', 'previews'),
            ])
            ->orderBy('date_taken', 'DESC')
            ->paginate(25);

        $events = \App\Models\Event::query()->orderBy('name', 'ASC')->get();

        return Inertia::render('Admin/Index', [
            'albums' => $albums,
            'events' => $events,
        ]);
    }

    public function showMedia(Album $album): \Illuminate\Http\JsonResponse
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
            $exifData = exif_read_data($preview);
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

    public function signPreviewUpload(SignPreviewUploadRequest $request, Album $album)
    {
        $validated = $request->validated();

        $key = 'media-uploads/tmp/' . (string) Str::uuid() . '/' . $this->sanitizeFilename($validated['filename']);

        $disk = Storage::disk(config('media-library.disk_name'));

        if (!method_exists($disk, 'getClient')) {
            return response()->json(['message' => 'Direct upload requires an S3-compatible disk.'], 503);
        }

        $client = $disk->getClient();
        $bucket = config('filesystems.disks.s3.bucket');

        $command = $client->getCommand('PutObject', [
            'Bucket' => $bucket,
            'Key' => $key,
            'ContentType' => $validated['mime_type'],
            'CacheControl' => 'max-age=604800',
        ]);

        $presigned = $client->createPresignedRequest($command, '+15 minutes');

        return response()->json([
            'key' => $key,
            'url' => (string) $presigned->getUri(),
            'headers' => [
                'Content-Type' => $validated['mime_type'],
                'Cache-Control' => 'max-age=604800',
            ],
        ]);
    }

    public function registerPreviewUpload(RegisterPreviewUploadRequest $request, Album $album)
    {
        $validated = $request->validated();

        $diskName = config('media-library.disk_name');
        $disk = Storage::disk($diskName);

        if (!$disk->exists($validated['key'])) {
            return response()->json(['message' => 'Uploaded object not found.'], 422);
        }

        $filename = $this->sanitizeFilename($validated['filename']);

        /** @var Photo $media */
        $media = $album->media()->create([
            'name' => pathinfo($filename, PATHINFO_FILENAME),
            'file_name' => $filename,
            'mime_type' => $validated['mime_type'],
            'disk' => $diskName,
            'conversions_disk' => $diskName,
            'collection_name' => 'previews',
            'size' => $validated['size'],
            'manipulations' => [],
            'custom_properties' => [
                'width' => $validated['width'],
                'height' => $validated['height'],
                'date_taken' => $validated['date_taken'] ?? null,
            ],
            'generated_conversions' => [],
            'responsive_images' => [],
            'order_column' => ($album->media()->where('collection_name', 'previews')->max('order_column') ?? 0) + 1,
        ]);

        $destination = PathGeneratorFactory::create($media)->getPath($media) . $media->file_name;

        $disk->copy($validated['key'], $destination);
        $disk->delete($validated['key']);

        return response()->json([
            'id' => $media->id,
            'file_name' => $media->file_name,
        ]);
    }

    private function sanitizeFilename(string $filename): string
    {
        $base = pathinfo($filename, PATHINFO_FILENAME);
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        $base = preg_replace('/[^A-Za-z0-9._-]+/', '-', $base) ?? 'file';

        return $ext !== '' ? $base . '.' . $ext : $base;
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

        return back();
    }

    public function updateAlbumCosplayerRemove(Request $request, Album $album, Cosplayer $cosplayer)
    {
        $album->cosplayers()->detach($cosplayer->id);

        return back();
    }

    public function updateCoverImage(Request $request, Album $album): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'cover_image_id' => ['required', 'numeric'],
        ]);

        $album->update($validated);

        return back();
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
