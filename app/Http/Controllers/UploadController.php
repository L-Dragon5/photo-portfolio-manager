<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CompleteUploadRequest;
use App\Http\Requests\SignUploadRequest;
use App\Jobs\IngestUploadedMedia;
use App\Models\Album;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Direct browser-to-S3 uploads.
 *
 * The browser PUTs each file straight to S3 with a presigned URL, so file bytes
 * never pass through PHP and post_max_size / max_execution_time never apply.
 * Ingest into the media library happens afterwards on the queue.
 */
class UploadController extends Controller
{
    /**
     * Extension is derived from the validated mime type rather than the
     * client-supplied filename so a crafted name cannot influence the S3 key.
     *
     * @var array<string, string>
     */
    private const EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
    ];
    private const URL_TTL_MINUTES = 60;

    /**
     * Issue one presigned PUT URL per file.
     */
    public function sign(SignUploadRequest $signUploadRequest, Album $album): JsonResponse
    {
        $disk = Storage::disk('s3');

        $uploads = collect($signUploadRequest->validated()['files'])
            ->map(function (array $file) use ($disk): array {
                $key = 'tmp/' . Str::uuid()->toString() . '.' . self::EXTENSIONS[$file['type']];

                $signed = $disk->temporaryUploadUrl(
                    $key,
                    now()->addMinutes(self::URL_TTL_MINUTES),
                );

                return [
                    'name' => $file['name'],
                    'key' => $key,
                    'url' => $signed['url'],
                    'headers' => $signed['headers'],
                ];
            })
            ->all();

        return response()->json(['uploads' => $uploads]);
    }

    /**
     * Queue ingest of files the browser has finished pushing to S3.
     */
    public function complete(CompleteUploadRequest $completeUploadRequest, Album $album): JsonResponse
    {
        $validated = $completeUploadRequest->validated();

        foreach ($validated['files'] as $file) {
            IngestUploadedMedia::dispatch(
                $album->id,
                $file['key'],
                $file['name'],
                $validated['collection'],
                $file['width'] ?? null,
                $file['height'] ?? null,
            );
        }

        return response()->json(['queued' => count($validated['files'])], 202);
    }
}
