<?php

namespace App\Console\Commands;

use App\Models\Album;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Zip;

class GenerateZips extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:zips';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate zips of albums';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $albums = Album::with('photos')->get();
        $bar = $this->output->createProgressBar(count($albums));
        $bar->start();

        foreach ($albums as $album) {
            if ($album->photos->isNotEmpty()) {
                $album_id = is_numeric($album->_id) ? intval($album->_id) : $album->_id;
                $filename = "zips/{$album_id}.zip";

                if (!Storage::has($filename)) {
                    try {
                        $album_db = Album::where('_id', $album_id)
                            ->with(['photos'])
                            ->firstOrFail();

                        $zip = Zip::create("{$album_id}.zip");

                        foreach ($album_db->photos as $photo) {
                            if (!empty($photo->location)) {
                                $zip->add($photo->location);
                            }
                        }

                        $zip->saveTo('s3://photo-portfolio-production-photoportfolioimages-zo958yhaaa6q/zips');

                        $this->info('Created new zip: ' . $filename);
                    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                        $this->error('Could not find album: ' . $album_id);
                    }
                }
            }

            $bar->advance();
        }

        $bar->finish();

        return Command::SUCCESS;
    }
}
