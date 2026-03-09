<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Mail\PreviewsSelected;
use App\Models\Album;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Spatie\MediaLibrary\Support\MediaStream;

class PublicController extends Controller
{
    public function __construct(private readonly \Illuminate\Routing\Redirector $redirector) {}
    /**
     * Display featured photos that I like.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $fps = \App\Models\FeaturedPhoto::query()->inRandomOrder()->get()->toArray();
        $photos = array_reduce($fps, function ($carry, array $fp) {
            $photo = \App\Models\Photo::query()->find($fp['media_id']);
            if (!empty($photo)) {
                $carry[] = $photo;
            }

            return $carry;
        }, []);

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
        $events = \App\Models\Event::query()->withCount('albums')->latest('start_date')->get();

        return Inertia::render('Public/Events', [
            'events' => $events,
        ]);
    }

    /**
     * Display listing of location shoots.
     */
    public function indexLocation(\Illuminate\Http\Request $request): \Inertia\Response
    {
        $sort = $request->input('sort', 'date-desc');

        $query = \App\Models\Album::query()
            ->where('is_public', true)
            ->where(function ($q): void {
                $q->where('event_id', null)->orWhere('event_id', '');
            });

        match ($sort) {
            'date-asc' => $query->orderBy('date_taken', 'ASC'),
            'name-asc' => $query->orderBy('name', 'ASC'),
            'name-desc' => $query->orderBy('name', 'DESC'),
            default => $query->orderBy('date_taken', 'DESC'),
        };

        return Inertia::render('Public/OnLocation', [
            'albums' => Inertia::scroll(function () use ($query) {
                $albums = $query->paginate(20);
                $albums->getCollection()->each->append('photos');

                return $albums;
            }),
            'sort' => $sort,
        ]);
    }

    /**
     * Display listing of press shoots.
     *
     * @return \Inertia\Response
     */
    public function indexPress()
    {
        $albums = \App\Models\Album::query()->where([
            ['is_public', '=', true],
            ['is_press', '=', true],
        ])->latest('start_date')->get();

        return Inertia::render('Public/Press', [
            'albums' => $albums,
        ]);
    }

    public function indexCulling($password)
    {
        try {
            $album = \App\Models\Album::query()->where('password', $password)->with(['relatedPhotos'])->firstOrFail();
            $album->append(['previews']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return Inertia::render('Public/AlbumNotFound');
        }

        return Inertia::render('Public/Culling', [
            'album' => $album,
        ]);
    }

    public function updateCulling(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'nullable', 'array'],
            'ids.*' => ['numeric'],
            'album_id' => ['required', 'numeric'],
        ]);

        $album = \App\Models\Album::query()->find($validated['album_id']);
        if (empty($validated['ids'])) {
            $album->relatedPhotos()->detach();
        } else {
            $album->relatedPhotos()->sync($validated['ids']);
        }

        $album->save();

        if (app()->isProduction()) {
            // Mail::to('me@joseph-oh.com')->send(new PreviewsSelected(($album)));
        }

        return $this->redirector->back();
    }

    /**
     * Display albums of specified event.
     */
    public function showEvent(\Illuminate\Http\Request $request, $id): \Inertia\Response
    {
        $sort = $request->input('sort', 'name-asc');

        if (is_numeric($id)) {
            $event = Event::find($id);
        } else {
            $event = \App\Models\Event::query()->where('url_alias', $id)->first();
        }

        $albumQuery = \App\Models\Album::query()
            ->where('event_id', $event->id)
            ->where('is_public', 1);

        match ($sort) {
            'date-asc' => $albumQuery->orderBy('date_taken', 'ASC'),
            'date-desc' => $albumQuery->orderBy('date_taken', 'DESC'),
            'name-desc' => $albumQuery->orderBy('name', 'DESC'),
            default => $albumQuery->orderBy('name', 'ASC'),
        };

        return Inertia::render('Public/SingleEvent', [
            'event' => $event,
            'albums' => Inertia::scroll(function () use ($albumQuery) {
                $albums = $albumQuery->paginate(20);
                $albums->getCollection()->each->append('photos');

                return $albums;
            }),
            'sort' => $sort,
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function showAlbum(Request $request)
    {
        $queries = explode('/', $request->getRequestUri());
        $queries = array_filter($queries);

        $type = array_shift($queries);
        $event = null;
        if ($type === 'events') {
            $eventQuery = array_shift($queries);

            if (is_numeric($eventQuery)) {
                $event = \App\Models\Event::query()->findOrFail($eventQuery);
            } else {
                $event = \App\Models\Event::query()->where('url_alias', $eventQuery)->firstOrFail();
            }
        }

        $albumToPresentId = array_pop($queries);

        try {
            if (is_numeric($albumToPresentId)) {
                $album = Album::with(['cosplayers']);
                if (!is_null($event)) {
                    $album = $album->where('event_id', $event->id);
                } else {
                    $album = $album->where(function ($q): void {
                        $q->where('event_id', null)->orWhere('event_id', '');
                    });
                }

                $album = $album->findOrFail($albumToPresentId);
            } else {
                $album = Album::with(['cosplayers'])->where('url_alias', $albumToPresentId);
                if (!is_null($event)) {
                    $album = $album->where('event_id', $event->id);
                } else {
                    $album = $album->where(function ($q): void {
                        $q->where('event_id', null)->orWhere('event_id', '');
                    });
                }

                $album = $album->firstOrFail();
            }

            $album->append('photos');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
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

        if (!is_null($event)) {
            $breadcrumbs[] = ['url_alias' => 'events/' . $event->url_alias, 'name' => $event->name];
        }

        return Inertia::render('Public/Album', [
            'album' => $album,
            'breadcrumbs' => $breadcrumbs ?? [],
        ]);
    }

    /**
     * Zip archive all photos in album and send download.
     */
    public function download(Album $album): ?\Spatie\MediaLibrary\Support\MediaStream
    {
        if ($album->is_public) {
            return MediaStream::create($album->id . '.zip')->addMedia($album->getMedia('photos'));
        }

        return null;
    }

    public function downloadPhoto(Request $request)
    {
        $validated = $request->validate([
            'url' => ['required', 'url'],
        ]);

        $photo = file_get_contents($validated['url']);
        if (!empty($photo)) {
            return response($photo, 200, [
                'Content-Type' => 'image/jpeg',
                'Content-Disposition' => 'attachment; filename="photo.jpg"',
            ]);
        }

        return null;
    }
}
