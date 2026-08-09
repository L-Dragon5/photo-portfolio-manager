<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Event;
use App\Models\FeaturedPhoto;
use App\Models\Photo;
use App\Models\Video;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Routing\Redirector;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\Support\MediaStream;

class PublicController extends Controller
{
    public function __construct(private readonly Redirector $redirector) {}
    /**
     * Display featured photos that I like.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $fps = FeaturedPhoto::query()->inRandomOrder()->get();
        $photosById = Photo::query()->whereIn('id', $fps->pluck('media_id'))->get()->keyBy('id');
        $photos = $fps->map(fn ($fp) => $photosById->get($fp->media_id))->filter()->values();

        return Inertia::render('Public/Index', [
            'featuredPhotos' => $photos,
        ]);
    }

    /**
     * Display list of events.
     *
     * @return Response
     */
    public function indexEvents()
    {
        $events = Event::query()->withCount('albums')->latest('start_date')->get();

        return Inertia::render('Public/Events', [
            'events' => $events,
        ]);
    }

    /**
     * Display listing of location shoots.
     */
    public function indexLocation(Request $request): Response
    {
        $sort = $request->input('sort', 'date-desc');
        $search = $request->input('search');

        $query = Album::query()
            ->where('is_public', true)
            ->where(function ($q): void {
                $q->where('event_id', null)->orWhere('event_id', '');
            })
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"));

        match ($sort) {
            'date-asc' => $query->orderBy('date_taken', 'ASC'),
            'name-asc' => $query->orderBy('name', 'ASC'),
            'name-desc' => $query->orderBy('name', 'DESC'),
            default => $query->orderBy('date_taken', 'DESC'),
        };

        return Inertia::render('Public/OnLocation', [
            'albums' => Inertia::scroll(function () use ($query) {
                return $query->paginate(20);
            }),
            'sort' => $sort,
            'search' => $search ?? '',
        ]);
    }

    /**
     * Display listing of press shoots.
     *
     * @return Response
     */
    public function indexPress()
    {
        $albums = Album::query()->where([
            ['is_public', '=', true],
            ['is_press', '=', true],
        ])->latest('start_date')->get();

        return Inertia::render('Public/Press', [
            'albums' => $albums,
        ]);
    }

    /**
     * Display standalone videos, i.e. those not attached to an album.
     */
    public function indexVideos(): Response
    {
        $videos = Video::query()
            ->whereNull('album_id')
            ->where('is_public', true)
            ->orderByRaw('date_taken IS NULL, date_taken DESC')
            ->orderBy('title', 'ASC')
            ->get();

        return Inertia::render('Public/Videos', [
            'videos' => $videos,
        ]);
    }

    public function indexCulling($password)
    {
        try {
            /**
             * Culling.jsx only reads the ids out of related_photos, to mark
             * which previews are already selected.
             */
            $album = Album::query()
                ->where('password', $password)
                ->with(['relatedPhotos' => fn ($q) => $q->select('media.id')])
                ->firstOrFail();
            $album->append(['previews'])->makeHidden('cover_image');
            $album->relatedPhotos->each->makeHidden('html');
        } catch (ModelNotFoundException) {
            return Inertia::render('Public/AlbumNotFound');
        }

        return Inertia::render('Public/Culling', [
            'album' => $album,
            'password' => $password,
        ]);
    }

    public function togglePhoto(string $password, Photo $photo, Request $request)
    {
        $validated = $request->validate([
            'selected' => ['required', 'boolean'],
        ]);

        $album = Album::query()->where('password', $password)->firstOrFail();

        $belongsToAlbum = $album->getMedia('previews')->contains('id', $photo->id)
            || $album->getMedia('photos')->contains('id', $photo->id);

        if (!$belongsToAlbum) {
            abort(422, 'Photo does not belong to this album.');
        }

        if ($validated['selected']) {
            $album->relatedPhotos()->syncWithoutDetaching([$photo->id]);
        } else {
            $album->relatedPhotos()->detach($photo->id);
        }

        return $this->redirector->back();
    }

    public function markCulled(string $password, Request $request)
    {
        $validated = $request->validate([
            'completed' => ['required', 'boolean'],
        ]);

        $album = Album::query()->where('password', $password)->firstOrFail();
        $album->culling_completed_at = $validated['completed'] ? now() : null;
        $album->save();

        return $this->redirector->back();
    }

    /**
     * Display albums of specified event.
     */
    public function showEvent(Request $request, $id): Response
    {
        $sort = $request->input('sort', 'name-asc');

        if (is_numeric($id)) {
            $event = Event::findOrFail($id);
        } else {
            $event = Event::query()->where('url_alias', $id)->firstOrFail();
        }

        $albumQuery = Album::query()
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
                $event = Event::query()->findOrFail($eventQuery);
            } else {
                $event = Event::query()->where('url_alias', $eventQuery)->firstOrFail();
            }
        }

        $albumToPresentId = array_pop($queries);

        try {
            if (is_numeric($albumToPresentId)) {
                $album = Album::with(['cosplayers', 'videos' => fn ($q) => $q->where('is_public', true)]);
                if (!is_null($event)) {
                    $album = $album->where('event_id', $event->id);
                } else {
                    $album = $album->where(function ($q): void {
                        $q->where('event_id', null)->orWhere('event_id', '');
                    });
                }

                $album = $album->findOrFail($albumToPresentId);
            } else {
                $album = Album::with(['cosplayers', 'videos' => fn ($q) => $q->where('is_public', true)])->where('url_alias', $albumToPresentId);
                if (!is_null($event)) {
                    $album = $album->where('event_id', $event->id);
                } else {
                    $album = $album->where(function ($q): void {
                        $q->where('event_id', null)->orWhere('event_id', '');
                    });
                }

                $album = $album->firstOrFail();
            }

        } catch (ModelNotFoundException) {
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
            /** Album.jsx renders the photo grid, never the cover thumbnail. */
            'album' => $album->makeHidden('cover_image'),
            'breadcrumbs' => $breadcrumbs ?? [],
            'photos' => Inertia::defer(fn () => $album->photos),
        ]);
    }

    /**
     * Zip archive all photos in album and send download.
     */
    public function download(Album $album): ?MediaStream
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
