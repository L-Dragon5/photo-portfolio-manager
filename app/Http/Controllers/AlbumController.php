<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlbumRequest;
use App\Http\Requests\UpdateAlbumRequest;
use App\Models\Album;
use App\Models\Event;
use App\Models\Photo;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Zip;

class AlbumController extends Controller
{
    /**
     * Display listing on admin page.
     *
     * @return  \Illuminate\Http\Response
     */
    public function index()
    {
        $albums = Album::orderBy('date_taken', 'DESC')->get();
        $events = Event::orderBy('name', 'ASC')->get();

        foreach ($albums as &$album) {
            $cover_photo = null;
            if (!is_null($album->cover_image_id)) {
                $cover_photo = $album->getMedia()->where('id', $album->cover_image_id)->first();
            }

            if (is_null($cover_photo)) {
                $media = $album->getFirstMedia();
                if (!is_null($media)) {
                    $cover_photo = $media;
                }
            }

            $album->cover_image = $cover_photo;
        }

        return Inertia::render('Admin/Index', [
            'albums' => $albums,
            'events' => $events
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(StoreAlbumRequest $request)
    {
        $validated = $request->validated();
        $photos = $validated['photos'];
        unset($validated['photos']);

        // Check if custom url alias is set. If not, make one.
        if (empty($validated['url_alias'])) {
            $validated['url_alias'] = str_replace(' ', '-', strtolower($validated['name']));
        }

        $album = Album::create([...$validated]);

        // Upload photos
        if (!empty($photos)) {
            foreach ($photos as $photo) {
                $album
                    ->addMedia($photo)
                    ->withResponsiveImages()
                    ->preservingOriginal()
                    ->toMediaCollection();
            }
        }

        return to_route('admin-base');
    }

    /**
     * Update the specified resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateAlbumRequest $request, Album $album)
    {
        try {
            $album = Album::findOrFail($request->id);

            // Check if name has changed.
            if (strcmp($request->name, $album->name) !== 0) {
                $album->name = $request->name;
            }

            // Check if parent album id is set.
            if (isset($request->album_id) && $request->album_id !== $album->album_id) {
                $album->album_id = $request->album_id;
            }

            // Check if a cover image has been uploaded.
            if (!empty($request->file('cover_image'))) {
                // Retrieve old image and prepare for deletion.
                $old_image = $album->cover_image;

                // Create image and resize image down if necessary.
                $img = \Image::make($request->file('cover_image'))
                    ->resize(1000, null, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    })
                    ->encode('webp');
                $name = md5($img->__toString()) . '.webp';
                $path = "cover_images/$name";
                if (Storage::put($path, $img->__toString())) {
                    $album->cover_image = $path;
                }

                // Delete old cover image if not placeholder.
                if ($old_image !== 'placeholder.webp') {
                    Storage::delete($old_image);
                }
            }

            // Check if url alias has changed.
            if (!empty($request->url_alias) && strcmp($request->url_alias, $album->url_alias) !== 0) {
                $album->url_alias = str_replace(' ', '-', strtolower($request->url_alias));
            }

            $success = $album->save();

            // Upload photos
            if (!empty($request->file('photos'))) {
                foreach ($request->file('photos') as $photo) {
                    // Check if file with same name already exists in album.
                    // If it doesn't, upload and save photo.
                    $check_existing_photo = Photo::where('location', $album->id . '/' . $photo->getClientOriginalName())->first();
                    if (empty($check_existing_photo)) {
                        $stored_photo = new Photo;
                        $stored_photo->album_id = $album->id;
                        $stored_photo->location = $photo->storeAs($album->id, $photo->getClientOriginalName());

                        [$width, $height] = getimagesize($photo);
                        if ($width > $height) {
                            $stored_photo->is_landscape = true;
                        } else {
                            $stored_photo->is_landscape = false;
                        }

                        $stored_photo->save();
                    }
                }
            }

            if ($success) {
                return back()->with('message', 'Updated album');
            } else {
                return back()->withErrors('Something went wrong while trying to update album');
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->withErrors('Could not find album');
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Album  $album
     * @return \Illuminate\Http\Response
     */
    public function destroy(Album $album)
    {
        // Iterate through photos and remove them.
        foreach ($album->photos as $photo) {
            $photo->delete();
        }

        // Set all child albums to root.
        $child_albums = Album::where('album_id', $album->id)->get();
        foreach ($child_albums as $child) {
            $child->album_id = null;
            $child->save();
        }

        // Finally, delete album.
        $album->delete();

        return to_route('admin-base');
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
                $album_db = Album::where('id', $album_id)
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

    /**
     * Turns albums flat array into tree.
     *
     * @param  int  $parent_id
     * @return  \Illuminate\Support\Collection
     */
    private function buildTree(\Illuminate\Database\Eloquent\Collection $albums, $parent_id = 0)
    {
        $branch = collect([]);

        foreach ($albums as $album) {
            if ($album->album_id === $parent_id) {
                if ($album->album_id === 0) {
                    $album->parent = '0 - Root';
                } else {
                    $album->parent = $album->parentAlbum->name;
                }

                $children = $this->buildTree($albums, $album['id']);
                if ($children->isNotEmpty()) {
                    $album['child_albums'] = $children;
                }

                $branch->push($album);
            }
        }

        return $branch;
    }

    /**
     * Turns albums tree into sorted flat array for available albums.
     *
     * @param  int  $level
     * @return  array
     */
    private function flattenTree(\Illuminate\Support\Collection $albums, $level = 0)
    {
        $flatArray = [];

        $albums = $albums->toArray();
        foreach ($albums as $album) {
            if (isset($album['child_albums']) && !empty($album['child_albums'])) {
                $album['name'] = str_repeat('=', $level) . ' ' . $album['name'];
                $flatArray[] = $album;
                $flatArray = array_merge($flatArray, $this->flattenTree($album['child_albums'], $level + 1));
            } else {
                $album['name'] = str_repeat('=', $level) . ' ' . $album['name'];
                $flatArray[] = ($album);
            }
        }

        return $flatArray;
    }

    private function nameToUrlAlias($inputString)
    {
        return str_replace(' ', '-', str_replace('-', '', strtolower($inputString)));
    }
}
