<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Event;
use App\Models\Photo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\MediaLibrary\Support\MediaStream;

class PublicController extends Controller
{
    /**
     * Display featured photos that I like.
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
     * Display list of events.
     *
     * @return \Inertia\Response
     */
    public function indexEvents()
    {
        $events = Event::orderBy('name', 'ASC')->get();

        return Inertia::render('Public/Events', [
            'events' => $events,
        ]);
    }

    /**
     * Display listing of location shoots.
     *
     * @return \Inertia\Response
     */
    public function indexLocation()
    {
        $albums = Album::where('is_public', true)->where(function ($q) {
            $q->where('event_id', null)->orWhere('event_id', '');
        })->orderBy('name', 'ASC')->get();

        return Inertia::render('Public/OnLocation', [
            'albums' => $albums,
        ]);
    }

    /**
     * Display listing of press shoots.
     * 
     * @return \Inertia\Response
     */
    public function indexPress()
    {
        $albums = Album::where([
            ['is_public', '=',  true],
            ['is_press', '=', true],
        ])->orderBy('name', 'ASC')->get();

        return Inertia::render('Public/Press', [
            'albums' => $albums,
        ]);
    }

    public function indexCulling($password)
    {
        try {
            $album = Album::where('password', $password)->firstOrFail();
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return Inertia::render('Public/AlbumNotFound');
        }

        return Inertia::render('Public/Culling', [
            'album' => $album
        ]);
    }

    /**
     * Display albums of specified event.
     * 
     * @return \Inertia\Response
     */
    public function showEvent($id)
    {
        if (is_numeric($id)) {
            $event = Event::with(['albums'])->find($id);
        } else {
            $event = Event::where('url_alias', $id)->with(['albums'])->first();
        }

        return Inertia::render('Public/SingleEvent', [
            'event' => $event,
            'albums' => $event->albums,
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function showAlbum(Request $request)
    {
        $queries = explode('/', $request->getRequestUri());
        $queries = array_filter($queries);

        $type = array_shift($queries);
        $eventId = null;
        if ($type === 'events') {
            $eventId = array_shift($queries);
        }

        $albumToPresentId = array_pop($queries);

        try {
            if (is_numeric($albumToPresentId)) {
                $album = Album::findOrFail($albumToPresentId);
            } else {
                $album = Album::where('url_alias', $albumToPresentId)
                ->firstOrFail();
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return Inertia::render('Public/AlbumNotFound');
        }

        // Create breadcrumbs.
        $breadcrumbs = [];
        if (!empty($type)) {
            $name = null;
            switch ($type) {
                case 'on-location':
                    $name = 'On-Location';
                    break;
                case 'events':
                    $name = 'Events';
                    break;
                case 'press':
                    $name = 'Press';
                    break;
            }
            $breadcrumbs[] = ['url_alias' => $type, 'name' => $name];
        }

        if (!empty($eventId)) {
            if (is_numeric($eventId)) {
                $event = Event::findOrFail($eventId);
            } else {
                $event = Event::where('url_alias', $eventId)->firstOrFail();
            }

            $breadcrumbs[] = ['url_alias' => "events/{$event->url_alias}", 'name' => $event->name];
        }

        return Inertia::render('Public/Album', [
            'album' => $album,
            'breadcrumbs' => isset($breadcrumbs) ? $breadcrumbs : [],
        ]);
    }

    /**
     * Zip archive all photos in album and send download.
     *
     * @param  \App\Models\Album    $album
     */
    public function download(Album $album)
    {
        if ($album->is_public) {
            return MediaStream::create($album->id . '.zip')->addMedia($album->getMedia('photos'));
        }
    }
}
