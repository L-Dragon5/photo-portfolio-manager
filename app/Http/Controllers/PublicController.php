<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Event;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Zip;

class PublicController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $photos = Photo::where('is_featured', 1)->inRandomOrder()->limit(20)->get();

        return Inertia::render('Public/Index', [
            'featuredPhotos' => $photos,
        ]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexEvents()
    {
        $events = Event::orderBy('name', 'ASC')->get();

        return Inertia::render('Public/Events', [
            'events' => $events,
        ]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexLocation()
    {
        $albums = Album::where([
            ['is_public', '=', true],
            ['event_id', '=', 0],
        ])->orderBy('name', 'ASC')->get();

        return Inertia::render('Public/OnLocation', [
            'albums' => $albums,
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  string  $alias
     * @return \Illuminate\Http\Response
     */
    public function show($alias)
    {
        $aliases = explode('/', $alias);
        $url_alias = array_pop($aliases);

        try {
            if (count($aliases) > 0) {
                $parent_alias = end($aliases);
                $parent_album = Album::where('url_alias', $parent_alias)->firstOrFail();

                $album = Album::where('url_alias', $url_alias)
                    ->where('album_id', $parent_album->_id)
                    ->with(['albums', 'photos'])
                    ->firstOrFail();
            } else {
                $album = Album::where('url_alias', $url_alias)
                    ->with(['albums', 'photos'])
                    ->firstOrFail();
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->withErrors('Could not find album');
        }

        // Set landscape flag for child album cover images.
        foreach ($album->albums as &$child) {
            // Set cover image path.
            $img = \Image::make(Storage::get($child->cover_image));
            $width = $img->width();
            $height = $img->height();
            if ($width > $height) {
                $child->is_landscape = true;
            } else {
                $child->is_landscape = false;
            }

            $child->cover_image = Storage::url($child->cover_image);
        }

        // Create breadcrumbs.
        $title = $album->name;
        $breadcrumbs = [];
        if (count($aliases) > 1) {
            for ($i = 0; $i < count($aliases); $i++) {
                $parentAlbum = Album::where('url_alias', $aliases[$i])->first();

                if ($i > 0) {
                    $breadcrumbs[] = ['url_alias' => $breadcrumbs[$i - 1]['url_alias'] . '/' . $parentAlbum->url_alias, 'name' => $parentAlbum->name];
                } else {
                    $breadcrumbs[] = ['url_alias' => $parentAlbum->url_alias, 'name' => $parentAlbum->name];
                }
            }
        } elseif (count($aliases) === 1) {
            $parentAlbum = Album::where('url_alias', reset($aliases))->first();
            $breadcrumbs[] = ['url_alias' => $parentAlbum->url_alias, 'name' => $parentAlbum->name];
        }

        // Retrieve URL for display.
        $album->cover_image = Storage::url($album->cover_image);

        return Inertia::render('Public/Album', [
            'album' => $album,
            'title' => $title,
            'breadcrumbs' => $breadcrumbs,
        ])->withViewData(['title' => $title]);
    }

    /**
     * Zip archive all photos in album and send download.
     *
     * @param  string  $album
     * @return  \Illuminate\Http\Response
     */
    public function download($album)
    {
        $album_id = is_numeric($album) ? intval($album) : $album;
        $filename = "zips/{$album_id}.zip";
        $zip = Storage::has($filename);
        if ($zip) {
            return Storage::url($filename);
        } else {
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

                return Storage::url($filename);
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                return back()->withErrors('Could not find album');
            }
        }
    }
}
