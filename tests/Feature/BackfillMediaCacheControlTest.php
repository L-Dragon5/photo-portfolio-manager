<?php

declare(strict_types=1);

use App\Console\Commands\BackfillMediaCacheControl;
use App\Models\Album;
use App\Models\Photo;
use Aws\CommandInterface;
use Aws\Result;
use Aws\S3\Exception\S3Exception;
use Aws\S3\S3Client;
use GuzzleHttp\Promise\Create;
use Illuminate\Filesystem\AwsS3V3Adapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

const TARGET_CACHE_CONTROL = 'public, max-age=31536000, immutable';

/**
 * An in-memory S3 behind a real S3Client, so the command's actual request
 * parameters (MetadataDirective, CopySourceIfMatch, ACL...) are exercised.
 */
final class FakeS3
{
    /** @var array<string, array<string, mixed>> */
    public array $objects = [];

    /** @var list<array<string, mixed>> */
    public array $copies = [];

    /** @var array<string, string> key => new etag, applied right after the object's first HeadObject */
    public array $changeAfterHead = [];

    public function put(string $key, array $attributes = []): void
    {
        $this->objects[$key] = [
            'ETag' => '"' . md5($key) . '"',
            'CacheControl' => 'max-age=604800',
            'ContentType' => 'image/jpeg',
            'Metadata' => [],
            'StorageClass' => null,
            'public' => false,
            ...$attributes,
        ];
    }

    public function client(): S3Client
    {
        return new S3Client([
            'region' => 'us-east-1',
            'version' => 'latest',
            'credentials' => ['key' => 'test', 'secret' => 'test'],
            'handler' => fn (CommandInterface $command) => $this->handle($command),
        ]);
    }

    private function handle(CommandInterface $command)
    {
        $key = $command['Key'] ?? null;

        if ($key !== null && !isset($this->objects[$key])) {
            return Create::rejectionFor(new S3Exception('Not Found', $command, ['code' => 'NoSuchKey']));
        }

        switch ($command->getName()) {
            case 'ListObjectsV2':
                $keys = array_filter(array_keys($this->objects), fn (string $k): bool => str_starts_with($k, $command['Prefix']));

                return Create::promiseFor(new Result(['Contents' => array_map(fn (string $k): array => ['Key' => $k], array_values($keys)), 'IsTruncated' => false]));

            case 'HeadObject':
                $object = $this->objects[$key];
                $result = new Result(array_filter([...$object, 'public' => null]));

                if (isset($this->changeAfterHead[$key])) {
                    $this->objects[$key]['ETag'] = $this->changeAfterHead[$key];
                    unset($this->changeAfterHead[$key]);
                }

                return Create::promiseFor($result);

            case 'GetObjectAcl':
                $grants = [['Grantee' => ['Type' => 'CanonicalUser', 'ID' => 'owner'], 'Permission' => 'FULL_CONTROL']];

                if ($this->objects[$key]['public']) {
                    $grants[] = ['Grantee' => ['Type' => 'Group', 'URI' => 'http://acs.amazonaws.com/groups/global/AllUsers'], 'Permission' => 'READ'];
                }

                return Create::promiseFor(new Result(['Grants' => $grants]));

            case 'CopyObject':
                $this->copies[] = $command->toArray();

                if (isset($command['CopySourceIfMatch']) && $command['CopySourceIfMatch'] !== $this->objects[$key]['ETag']) {
                    return Create::rejectionFor(new S3Exception('At least one of the pre-conditions you specified did not hold', $command, ['code' => 'PreconditionFailed']));
                }

                $this->objects[$key] = [
                    'ETag' => $this->objects[$key]['ETag'],
                    'CacheControl' => $command['CacheControl'] ?? null,
                    'ContentType' => $command['ContentType'] ?? null,
                    'Metadata' => $command['Metadata'] ?? [],
                    'StorageClass' => $command['StorageClass'] ?? null,
                    'public' => ($command['ACL'] ?? null) === 'public-read',
                ];

                return Create::promiseFor(new Result([]));
        }

        throw new RuntimeException('Unhandled S3 command ' . $command->getName());
    }
}

function s3Photo(string $disk = 's3'): Photo
{
    $album = Album::query()->create(['name' => 'Backfill', 'url_alias' => 'backfill-' . uniqid()]);

    return Photo::query()->create([
        'model_type' => Album::class,
        'model_id' => $album->id,
        'uuid' => (string) Str::uuid(),
        'collection_name' => 'photos',
        'name' => 'shot',
        'file_name' => 'shot.jpg',
        'mime_type' => 'image/jpeg',
        'disk' => $disk,
        'conversions_disk' => $disk,
        'size' => 1000,
        'manipulations' => [],
        'custom_properties' => [],
        'generated_conversions' => [],
        'responsive_images' => [],
        'order_column' => 1,
    ]);
}

/**
 * @return list<array<string, string>>
 */
function csvRows(string $path): array
{
    $lines = array_map(fn (string $line): array => str_getcsv($line, escape: ''), file($path, FILE_IGNORE_NEW_LINES));
    $columns = array_shift($lines);

    return array_map(fn (array $values): array => array_combine($columns, $values), $lines);
}

beforeEach(function (): void {
    config(['media-library.remote.extra_headers.CacheControl' => TARGET_CACHE_CONTROL, 'filesystems.disks.s3.bucket' => 'test-bucket']);

    $this->s3 = new FakeS3;
    $client = $this->s3->client();
    Storage::set('s3', Mockery::mock(AwsS3V3Adapter::class)->shouldReceive('getClient')->andReturn($client)->getMock());

    $this->out = sys_get_temp_dir() . '/media-cache-backfill-test-' . uniqid();
    BackfillMediaCacheControl::$snapshotRowLimit = 100_000;
});

afterEach(function (): void {
    foreach (glob($this->out . '/*') ?: [] as $file) {
        unlink($file);
    }

    @rmdir($this->out);
});

it('rewrites stale Cache-Control on every media object and preserves everything else', function (): void {
    $photo = s3Photo();
    $original = "{$photo->id}/shot.jpg";
    $conversion = "{$photo->id}/conversions/shot-thumb.jpg";
    $responsive = "{$photo->id}/responsive-images/shot___media_library_original_600_450.jpg";
    $current = "{$photo->id}/responsive-images/shot___media_library_original_300_225.jpg";

    $this->s3->put($original, ['Metadata' => ['camera' => 'x100'], 'StorageClass' => 'STANDARD_IA', 'public' => true]);
    $this->s3->put($conversion, ['ContentType' => 'image/webp']);
    $this->s3->put($responsive, ['CacheControl' => null]);
    $this->s3->put($current, ['CacheControl' => TARGET_CACHE_CONTROL]);
    $this->s3->put('tmp/staged-upload.jpg');
    $this->s3->put('backups/db.sqlite', ['ContentType' => 'application/octet-stream']);

    $this->artisan('media:backfill-cache-control', ['--out' => $this->out])->assertSuccessful();

    expect($this->s3->objects[$original])
        ->CacheControl->toBe(TARGET_CACHE_CONTROL)
        ->ContentType->toBe('image/jpeg')
        ->Metadata->toBe(['camera' => 'x100'])
        ->StorageClass->toBe('STANDARD_IA')
        ->public->toBeTrue()
        ->and($this->s3->objects[$conversion])->CacheControl->toBe(TARGET_CACHE_CONTROL)->ContentType->toBe('image/webp')->public->toBeFalse()
        ->and($this->s3->objects[$responsive]['CacheControl'])->toBe(TARGET_CACHE_CONTROL)
        ->and($this->s3->objects['tmp/staged-upload.jpg']['CacheControl'])->toBe('max-age=604800')
        ->and($this->s3->objects['backups/db.sqlite']['CacheControl'])->toBe('max-age=604800');

    expect(collect($this->s3->copies)->pluck('Key')->sort()->values()->all())->toBe(collect([$original, $conversion, $responsive])->sort()->values()->all())
        ->and(collect($this->s3->copies)->pluck('MetadataDirective')->unique()->all())->toBe(['REPLACE'])
        ->and(collect($this->s3->copies)->firstWhere('Key', $conversion))->not->toHaveKey('ACL');

    $report = collect(csvRows(glob("{$this->out}/report-*.csv")[0]))->keyBy('key');
    expect($report[$original])->status->toBe('updated')->category->toBe('original')->before_cache_control->toBe('max-age=604800')->after_cache_control->toBe(TARGET_CACHE_CONTROL)
        ->and($report[$conversion]['category'])->toBe('conversion')
        ->and($report[$responsive])->category->toBe('responsive')->before_cache_control->toBe('')
        ->and($report[$current]['status'])->toBe('already-current');

    expect(csvRows(glob("{$this->out}/snapshot-*.csv")[0]))->toHaveCount(4)
        ->and(file_get_contents("{$this->out}/progress.log"))->toContain('media-cache-backfill Apply | 100.0%')
        ->and(file_get_contents(glob("{$this->out}/summary-*.md")[0]))->toContain('| original | 1 | 0 | 0 | 0 | 0 |');
});

it('writes nothing on a dry run but reports what would change', function (): void {
    $photo = s3Photo();
    $this->s3->put("{$photo->id}/shot.jpg");

    $this->artisan('media:backfill-cache-control', ['--out' => $this->out, '--dry-run' => true])->assertSuccessful();

    expect($this->s3->copies)->toBeEmpty()
        ->and($this->s3->objects["{$photo->id}/shot.jpg"]['CacheControl'])->toBe('max-age=604800')
        ->and(csvRows(glob("{$this->out}/report-*.csv")[0])[0]['status'])->toBe('would-update');
});

it('refuses to overwrite an object that changed after the snapshot', function (): void {
    $photo = s3Photo();
    $key = "{$photo->id}/shot.jpg";
    $this->s3->put($key);
    $this->s3->changeAfterHead[$key] = '"re-uploaded"';

    $this->artisan('media:backfill-cache-control', ['--out' => $this->out])->assertFailed();

    $row = csvRows(glob("{$this->out}/report-*.csv")[0])[0];
    expect($this->s3->objects[$key]['CacheControl'])->toBe('max-age=604800')
        ->and($row['status'])->toBe('error')
        ->and($row['error'])->toContain('PreconditionFailed');
});

it('restores every object to its snapshot Cache-Control', function (): void {
    $photo = s3Photo();
    $this->s3->put("{$photo->id}/shot.jpg", ['public' => true]);
    $this->s3->put("{$photo->id}/conversions/thumb.jpg", ['CacheControl' => null]);

    $this->artisan('media:backfill-cache-control', ['--out' => $this->out])->assertSuccessful();
    $snapshot = glob("{$this->out}/snapshot-*.csv")[0];

    $this->artisan('media:backfill-cache-control', ['--out' => $this->out, '--restore' => $snapshot])->assertSuccessful();

    expect($this->s3->objects["{$photo->id}/shot.jpg"])->CacheControl->toBe('max-age=604800')->public->toBeTrue()
        ->and($this->s3->objects["{$photo->id}/conversions/thumb.jpg"]['CacheControl'])->toBeNull()
        ->and(collect($this->s3->copies)->last())->not->toHaveKey('CopySourceIfMatch');
});

it('ignores media stored on non-S3 disks', function (): void {
    $photo = s3Photo('public');
    $this->s3->put("{$photo->id}/shot.jpg");

    $this->artisan('media:backfill-cache-control', ['--out' => $this->out])->assertSuccessful();

    expect($this->s3->copies)->toBeEmpty();
});

it('stops before snapshotting when the object count exceeds the snapshot limit', function (): void {
    BackfillMediaCacheControl::$snapshotRowLimit = 1;
    $photo = s3Photo();
    $this->s3->put("{$photo->id}/shot.jpg");
    $this->s3->put("{$photo->id}/conversions/thumb.jpg");

    $this->artisan('media:backfill-cache-control', ['--out' => $this->out])
        ->expectsOutputToContain('--allow-large-snapshot')
        ->assertFailed();

    expect($this->s3->copies)->toBeEmpty()
        ->and(glob("{$this->out}/snapshot-*.csv"))->toBeEmpty();
});
