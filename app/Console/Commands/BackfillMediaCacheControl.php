<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Photo;
use Aws\S3\Exception\S3Exception;
use Aws\S3\S3Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\Support\PathGenerator\PathGeneratorFactory;
use Throwable;

/**
 * Rewrites the Cache-Control header on media objects already in S3 so they
 * match `media-library.remote.extra_headers`. New writes get the header from
 * Spatie; this only exists for objects written before the header changed.
 *
 * Two passes. The snapshot pass is read-only: HeadObject + GetObjectAcl on
 * every object, written to CSV before anything is modified. The apply pass
 * copies each object onto itself with MetadataDirective=REPLACE, carrying
 * over content type, user metadata, storage class, encryption and a
 * public-read grant. CopySourceIfMatch pins each copy to the snapshot ETag, so
 * an object that changed after the snapshot is reported, not overwritten.
 *
 * Objects are found through the media table, never a bucket listing, so
 * staged `tmp/` uploads and anything else in the bucket are never touched.
 */
class BackfillMediaCacheControl extends Command
{
    public static int $snapshotRowLimit = 100_000;
    private const SNAPSHOT_COLUMNS = [
        'disk', 'key', 'category', 'etag', 'cache_control', 'content_type', 'content_disposition',
        'content_encoding', 'storage_class', 'server_side_encryption', 'kms_key_id', 'is_public', 'metadata_json', 'snapshot_error',
    ];
    private const REPORT_COLUMNS = ['disk', 'key', 'category', 'status', 'before_cache_control', 'after_cache_control', 'error'];

    /**
     * @var string
     */
    protected $signature = 'media:backfill-cache-control
        {--dry-run : Snapshot and report what would change without writing to S3}
        {--limit= : Only process the first N objects (for a trial run)}
        {--restore= : Path to a snapshot CSV; puts each object\'s Cache-Control back to its snapshot value}
        {--allow-large-snapshot : Run even when more than 100k objects would be snapshotted}
        {--out=/tmp/media-cache-backfill : Directory for progress.log, the snapshot, the report CSV and summary}';

    /**
     * @var string
     */
    protected $description = 'Rewrite Cache-Control on existing S3 media objects to match media-library.remote.extra_headers';
    private string $outDir;
    private string $stamp;
    private float $phaseStartedAt = 0.0;
    private float $lastProgressAt = 0.0;
    private int $lastProgressCount = 0;

    /**
     * @var array<string, S3Client>
     */
    private array $clients = [];

    public function handle(): int
    {
        $this->outDir = rtrim((string) $this->option('out'), '/');
        $this->stamp = now()->format('Ymd-His');

        if (!is_dir($this->outDir) && !mkdir($this->outDir, 0755, true) && !is_dir($this->outDir)) {
            $this->error("Cannot create {$this->outDir}");

            return self::FAILURE;
        }

        $this->line("Follow progress: tail -f {$this->progressLogPath()}");

        if ($this->option('restore')) {
            return $this->restore((string) $this->option('restore'));
        }

        $target = config('media-library.remote.extra_headers.CacheControl');

        if (!is_string($target) || $target === '') {
            $this->error('media-library.remote.extra_headers.CacheControl is not set; nothing to backfill to.');

            return self::FAILURE;
        }

        $objects = $this->discoverObjects();

        if ($this->option('limit') !== null) {
            $objects = array_slice($objects, 0, max(0, (int) $this->option('limit')));
        }

        $total = count($objects);

        if ($total > self::$snapshotRowLimit && !$this->option('allow-large-snapshot')) {
            $this->error("{$total} objects exceeds the " . self::$snapshotRowLimit . ' snapshot limit. Get approval, then rerun with --allow-large-snapshot.');

            return self::FAILURE;
        }

        $this->progress('Discovered', $total, $total, 0, 'media objects on S3 disks');

        $snapshotPath = "{$this->outDir}/snapshot-{$this->stamp}.csv";
        $snapshot = $this->takeSnapshot($objects, $snapshotPath);
        $this->line("Snapshot: {$snapshotPath}");

        $reportRows = $this->apply($snapshot, $target, (bool) $this->option('dry-run'));

        $reportPath = "{$this->outDir}/report-{$this->stamp}.csv";
        $this->writeCsv($reportPath, self::REPORT_COLUMNS, $reportRows);

        $summaryPath = "{$this->outDir}/summary-{$this->stamp}.md";
        file_put_contents($summaryPath, $this->summary($reportRows, $target, $snapshotPath, $reportPath));

        $this->newLine();
        $this->line((string) file_get_contents($summaryPath));

        $failed = count(array_filter($reportRows, fn (array $row): bool => in_array($row['status'], ['error', 'unverified'], true)));

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @return list<array{disk: string, key: string}>
     */
    private function discoverObjects(): array
    {
        $found = [];

        Photo::query()->orderBy('id')->each(function (Photo $media) use (&$found): void {
            $prefix = PathGeneratorFactory::create($media)->getPath($media);

            foreach (array_unique([$media->disk, $media->conversions_disk ?: $media->disk]) as $disk) {
                if (config("filesystems.disks.{$disk}.driver") !== 's3') {
                    continue;
                }

                foreach ($this->listKeys($disk, $prefix) as $key) {
                    $found["{$disk}\0{$key}"] = ['disk' => $disk, 'key' => $key];
                }
            }
        });

        return array_values($found);
    }

    /**
     * @return list<string>
     */
    private function listKeys(string $disk, string $prefix): array
    {
        $keys = [];
        $pages = $this->client($disk)->getPaginator('ListObjectsV2', ['Bucket' => $this->bucket($disk), 'Prefix' => $prefix]);

        foreach ($pages as $page) {
            foreach ($page['Contents'] ?? [] as $object) {
                $keys[] = $object['Key'];
            }
        }

        return $keys;
    }

    /**
     * @param  list<array{disk: string, key: string}>  $objects
     * @return list<array<string, string>>
     */
    private function takeSnapshot(array $objects, string $path): array
    {
        $rows = [];
        $total = count($objects);
        $errors = 0;
        $this->startPhase();

        foreach ($objects as $index => $object) {
            try {
                $rows[] = $this->snapshotRow($object['disk'], $object['key']);
            } catch (Throwable $exception) {
                $errors++;
                $rows[] = [...array_fill_keys(self::SNAPSHOT_COLUMNS, ''), 'disk' => $object['disk'], 'key' => $object['key'],
                    'category' => $this->category($object['key']), 'snapshot_error' => $this->errorMessage($exception)];
            }

            $this->maybeProgress('Snapshot', $index + 1, $total, $errors);
        }

        $this->writeCsv($path, self::SNAPSHOT_COLUMNS, $rows);
        $this->progress('Snapshot', $total, $total, $errors, 'written');

        return $rows;
    }

    /**
     * @return array<string, string>
     */
    private function snapshotRow(string $disk, string $key): array
    {
        $client = $this->client($disk);
        $params = ['Bucket' => $this->bucket($disk), 'Key' => $key];
        $head = $client->headObject($params);
        $grants = $client->getObjectAcl($params)['Grants'] ?? [];

        $isPublic = collect($grants)->contains(fn (array $grant): bool => ($grant['Grantee']['URI'] ?? '') === 'http://acs.amazonaws.com/groups/global/AllUsers'
            && in_array($grant['Permission'] ?? '', ['READ', 'FULL_CONTROL'], true));

        return [
            'disk' => $disk,
            'key' => $key,
            'category' => $this->category($key),
            'etag' => (string) ($head['ETag'] ?? ''),
            'cache_control' => (string) ($head['CacheControl'] ?? ''),
            'content_type' => (string) ($head['ContentType'] ?? ''),
            'content_disposition' => (string) ($head['ContentDisposition'] ?? ''),
            'content_encoding' => (string) ($head['ContentEncoding'] ?? ''),
            'storage_class' => (string) ($head['StorageClass'] ?? ''),
            'server_side_encryption' => (string) ($head['ServerSideEncryption'] ?? ''),
            'kms_key_id' => (string) ($head['SSEKMSKeyId'] ?? ''),
            'is_public' => $isPublic ? '1' : '0',
            'metadata_json' => json_encode((object) ($head['Metadata'] ?? []), JSON_THROW_ON_ERROR),
            'snapshot_error' => '',
        ];
    }

    /**
     * @param  list<array<string, string>>  $snapshot
     * @return list<array<string, string>>
     */
    private function apply(array $snapshot, string $target, bool $dryRun): array
    {
        $report = [];
        $total = count($snapshot);
        $errors = 0;
        $phase = $dryRun ? 'Dry run' : 'Apply';
        $this->startPhase();

        foreach ($snapshot as $index => $row) {
            $entry = ['disk' => $row['disk'], 'key' => $row['key'], 'category' => $row['category'],
                'before_cache_control' => $row['cache_control'], 'after_cache_control' => $row['cache_control'], 'error' => ''];

            if ($row['snapshot_error'] !== '') {
                $errors++;
                $report[] = [...$entry, 'status' => 'error', 'error' => 'snapshot failed: ' . $row['snapshot_error']];
            } elseif ($row['cache_control'] === $target) {
                $report[] = [...$entry, 'status' => 'already-current'];
            } elseif ($dryRun) {
                $report[] = [...$entry, 'status' => 'would-update', 'after_cache_control' => $target];
            } else {
                try {
                    $this->rewrite($row, $target, guardEtag: true);
                    $after = (string) ($this->client($row['disk'])->headObject(['Bucket' => $this->bucket($row['disk']), 'Key' => $row['key']])['CacheControl'] ?? '');
                    $report[] = [...$entry, 'status' => $after === $target ? 'updated' : 'unverified', 'after_cache_control' => $after];
                    $errors += $after === $target ? 0 : 1;
                } catch (Throwable $exception) {
                    $errors++;
                    $report[] = [...$entry, 'status' => 'error', 'error' => $this->errorMessage($exception)];
                }
            }

            $this->maybeProgress($phase, $index + 1, $total, $errors);
        }

        $this->progress($phase, $total, $total, $errors, 'finished');

        return $report;
    }

    private function restore(string $snapshotPath): int
    {
        if (!is_readable($snapshotPath)) {
            $this->error("Cannot read snapshot {$snapshotPath}");

            return self::FAILURE;
        }

        $rows = array_values(array_filter($this->readCsv($snapshotPath), fn (array $row): bool => $row['snapshot_error'] === ''));
        $total = count($rows);
        $errors = 0;
        $report = [];
        $this->startPhase();

        foreach ($rows as $index => $row) {
            $entry = ['disk' => $row['disk'], 'key' => $row['key'], 'category' => $row['category'], 'before_cache_control' => '',
                'after_cache_control' => $row['cache_control'], 'error' => ''];

            try {
                $this->rewrite($row, $row['cache_control'], guardEtag: false);
                $report[] = [...$entry, 'status' => 'restored'];
            } catch (Throwable $exception) {
                $errors++;
                $report[] = [...$entry, 'status' => 'error', 'error' => $this->errorMessage($exception)];
            }

            $this->maybeProgress('Restore', $index + 1, $total, $errors);
        }

        $this->progress('Restore', $total, $total, $errors, 'finished');
        $reportPath = "{$this->outDir}/restore-{$this->stamp}.csv";
        $this->writeCsv($reportPath, self::REPORT_COLUMNS, $report);
        $this->line("Restore report: {$reportPath}");

        return $errors === 0 ? self::SUCCESS : self::FAILURE;
    }

    /**
     * The ETag guard is skipped on restore because an in-place copy of a
     * multipart object changes its ETag, so the snapshot value no longer matches.
     *
     * @param  array<string, string>  $row
     */
    private function rewrite(array $row, string $cacheControl, bool $guardEtag): void
    {
        $bucket = $this->bucket($row['disk']);

        $params = array_filter([
            'Bucket' => $bucket,
            'Key' => $row['key'],
            'CopySource' => $bucket . '/' . str_replace('%2F', '/', rawurlencode($row['key'])),
            'CopySourceIfMatch' => $guardEtag ? $row['etag'] : '',
            'MetadataDirective' => 'REPLACE',
            'CacheControl' => $cacheControl,
            'ContentType' => $row['content_type'],
            'ContentDisposition' => $row['content_disposition'],
            'ContentEncoding' => $row['content_encoding'],
            'StorageClass' => $row['storage_class'],
            'ServerSideEncryption' => $row['server_side_encryption'],
            'SSEKMSKeyId' => $row['kms_key_id'],
            'ACL' => $row['is_public'] === '1' ? 'public-read' : '',
        ], fn (string $value): bool => $value !== '');

        $params['Metadata'] = json_decode($row['metadata_json'] ?: '{}', true, flags: JSON_THROW_ON_ERROR);

        $this->client($row['disk'])->copyObject($params);
    }

    private function category(string $key): string
    {
        return match (true) {
            str_contains($key, '/responsive-images/') => 'responsive',
            str_contains($key, '/conversions/') => 'conversion',
            default => 'original',
        };
    }

    private function client(string $disk): S3Client
    {
        return $this->clients[$disk] ??= Storage::disk($disk)->getClient();
    }

    private function bucket(string $disk): string
    {
        return (string) config("filesystems.disks.{$disk}.bucket");
    }

    private function errorMessage(Throwable $exception): string
    {
        return $exception instanceof S3Exception
            ? ($exception->getAwsErrorCode() ?? 'S3Exception') . ': ' . ($exception->getAwsErrorMessage() ?? $exception->getMessage())
            : $exception->getMessage();
    }

    private function startPhase(): void
    {
        $this->phaseStartedAt = $this->lastProgressAt = microtime(true);
        $this->lastProgressCount = 0;
    }

    /**
     * Emits an update every 250 objects or 30 seconds, whichever comes first,
     * which keeps a large run well inside the five-minute update rule.
     */
    private function maybeProgress(string $phase, int $done, int $total, int $errors): void
    {
        if ($done - $this->lastProgressCount >= 250 || microtime(true) - $this->lastProgressAt >= 30) {
            $this->progress($phase, $done, $total, $errors);
        }
    }

    private function progress(string $phase, int $done, int $total, int $errors, string $note = ''): void
    {
        $elapsed = max(microtime(true) - $this->phaseStartedAt, 0.001);
        $rate = $done / $elapsed;
        $percent = $total === 0 ? 100.0 : $done / $total * 100;
        $eta = $rate > 0 ? (int) round(($total - $done) / $rate) : 0;

        $line = sprintf(
            '[%s] media-cache-backfill %s | %5.1f%% | ETA %s | %d/%d | %.1f obj/s | errors %d%s',
            now()->toDateTimeString(), $phase, $percent, gmdate('H:i:s', $eta), $done, $total, $rate, $errors, $note === '' ? '' : " | {$note}",
        );

        $this->line($line);
        file_put_contents($this->progressLogPath(), $line . PHP_EOL, FILE_APPEND);

        $this->lastProgressAt = microtime(true);
        $this->lastProgressCount = $done;
    }

    private function progressLogPath(): string
    {
        return "{$this->outDir}/progress.log";
    }

    /**
     * @param  list<array<string, string>>  $rows
     */
    private function summary(array $rows, string $target, string $snapshotPath, string $reportPath): string
    {
        $statuses = ['updated', 'would-update', 'already-current', 'unverified', 'error'];
        $byCategory = collect($rows)->groupBy('category');

        $lines = [
            '# Media Cache-Control backfill ' . ($this->option('dry-run') ? '(dry run)' : ''),
            '',
            "Target: `{$target}`",
            '',
            '| category | ' . implode(' | ', $statuses) . ' |',
            '|---|' . str_repeat('---|', count($statuses)),
        ];

        foreach (['original', 'conversion', 'responsive'] as $category) {
            $group = $byCategory->get($category, collect());
            $lines[] = "| {$category} | " . implode(' | ', array_map(fn (string $status): int => $group->where('status', $status)->count(), $statuses)) . ' |';
        }

        $lines[] = '';
        $lines[] = '## Examples (before -> after)';

        foreach ($byCategory as $category => $group) {
            foreach ($group->take(2) as $row) {
                $before = $row['before_cache_control'] === '' ? '(none)' : $row['before_cache_control'];
                $lines[] = "- {$category} `{$row['key']}`: `{$before}` -> `{$row['after_cache_control']}` ({$row['status']})";
            }
        }

        $lines[] = '';
        $lines[] = "Snapshot: {$snapshotPath}";
        $lines[] = "Before/after CSV: {$reportPath}";
        $lines[] = "Rollback: php artisan media:backfill-cache-control --restore={$snapshotPath}";

        return implode(PHP_EOL, $lines) . PHP_EOL;
    }

    /**
     * @param  list<string>  $columns
     * @param  list<array<string, string>>  $rows
     */
    private function writeCsv(string $path, array $columns, array $rows): void
    {
        $handle = fopen($path, 'w');
        fputcsv($handle, $columns, escape: '');

        foreach ($rows as $row) {
            fputcsv($handle, array_map(fn (string $column): string => $row[$column] ?? '', $columns), escape: '');
        }

        fclose($handle);
    }

    /**
     * @return list<array<string, string>>
     */
    private function readCsv(string $path): array
    {
        $handle = fopen($path, 'r');
        $columns = fgetcsv($handle, escape: '');
        $rows = [];

        while (($values = fgetcsv($handle, escape: '')) !== false) {
            $rows[] = array_combine($columns, $values);
        }

        fclose($handle);

        return $rows;
    }
}
