<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Album;
use App\Models\FeaturedPhoto;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Attach a file the browser already pushed to S3 to an album's media library.
 *
 * Spatie's remote path (FileAdder::toMediaCollectionFromRemote) issues a
 * server-side S3 copy, so the image bytes are never streamed through PHP for
 * the move itself. Responsive image generation is queued separately by the
 * media library once the media row exists.
 */
class IngestUploadedMedia implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;
    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [10, 30, 60];

    public function __construct(
        private readonly int $albumId,
        private readonly string $key,
        private readonly string $originalName,
        private readonly string $collection,
        private readonly ?int $width = null,
        private readonly ?int $height = null,
    ) {}

    public function handle(): void
    {
        $album = Album::query()->find($this->albumId);

        if (is_null($album)) {
            Storage::disk('s3')->delete($this->key);

            return;
        }

        $media = $album
            ->addMediaFromDisk($this->key, 's3')
            ->usingName(pathinfo($this->originalName, PATHINFO_FILENAME))
            ->usingFileName($this->originalName)
            ->withCustomProperties([
                'width' => $this->width,
                'height' => $this->height,
                'date_taken' => $this->dateTaken(),
            ])
            ->toMediaCollection($this->collection);

        // ponytail: re-uploading the same filename replaces the old file. Deleting
        // after the copy lands means a failed ingest never destroys what was there.
        $replaced = $album->media()
            ->where('collection_name', $this->collection)
            ->where('file_name', $media->file_name)
            ->whereKeyNot($media->getKey())
            ->get();

        if ($replaced->isEmpty()) {
            return;
        }

        FeaturedPhoto::query()
            ->whereIn('media_id', $replaced->modelKeys())
            ->update(['media_id' => $media->getKey()]);

        $replaced->each->delete();
    }

    public function failed(\Throwable $throwable): void
    {
        Log::error('Failed to ingest uploaded media', [
            'album_id' => $this->albumId,
            'key' => $this->key,
            'name' => $this->originalName,
            'exception' => $throwable->getMessage(),
        ]);
    }

    /**
     * Read EXIF DateTimeOriginal as a unix timestamp, matching what the old
     * synchronous upload stored. Album::photos() sorts on this property.
     */
    private function dateTaken(): ?int
    {
        if (!str_ends_with(strtolower($this->key), '.jpg') && !str_ends_with(strtolower($this->key), '.jpeg')) {
            return null;
        }

        if (!function_exists('exif_read_data')) {
            return null;
        }

        $temporaryPath = null;

        try {
            $source = Storage::disk('s3')->readStream($this->key);

            if ($source === false || is_null($source)) {
                return null;
            }

            // ponytail: copies the whole object to disk because exif_read_data needs a
            // seekable stream and S3 streams are not. Fine inside a queue job. If ingest
            // throughput ever matters, range-read the first 256KB instead.
            $temporaryPath = tempnam(sys_get_temp_dir(), 'exif');
            $destination = fopen($temporaryPath, 'wb');
            stream_copy_to_stream($source, $destination);
            fclose($destination);
            fclose($source);

            $exif = @exif_read_data($temporaryPath);

            if ($exif === false || !isset($exif['DateTimeOriginal'])) {
                return null;
            }

            return strtotime((string) $exif['DateTimeOriginal']) ?: null;
        } catch (\Throwable) {
            return null;
        } finally {
            if (!is_null($temporaryPath) && file_exists($temporaryPath)) {
                unlink($temporaryPath);
            }
        }
    }
}
