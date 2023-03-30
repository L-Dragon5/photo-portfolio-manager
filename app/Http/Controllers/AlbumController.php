<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Zip;

class AlbumController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $albums = Album::where('album_id', 0)->orderBy('name')->get();

        foreach ($albums as &$album) {
            // Retrieve URL for display.
            $album->cover_image = Storage::url($album->cover_image);
        }

        return Inertia::render('Public/Index', [
            'albums' => $albums,
        ])->withViewData(['title' => 'Home']);
    }

    /**
     * Display listing on admin page.
     *
     * @return  \Illuminate\Http\Response
     */
    public function adminIndex()
    {
        $available_albums = Album::with(['photos'])->orderBy('name')->get();
        $albums = $this->buildTree($available_albums);
        $flatTreeAlbums = $this->flattenTree($albums);

        foreach ($albums as &$album) {
            // Retrieve URL for display.
            $album->cover_image = Storage::url($album->cover_image);
        }

        return Inertia::render('Admin/Index', [
            'albums' => $albums,
            'availableAlbums' => $flatTreeAlbums,
        ])->withViewData(['title' => 'Admin Home']);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'string|required',
            'album_id' => 'nullable',
            'cover_image' => 'image|nullable',
            'url_alias' => 'string|nullable',
            'photos' => 'array|nullable',
        ]);

        $album = new Album;
        $album->name = $request->name;
        $album->cover_image = 'placeholder.webp';

        // Check if parent album id is set.
        if (!empty($request->album_id)) {
            $album->album_id = $request->album_id;
        }

        // Check if a cover image has been uploaded.
        if (!empty($request->file('cover_image'))) {
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
        }

        // Check if custom url alias is set. If not, make one.
        if (!empty($request->url_alias)) {
            $album->url_alias = $request->url_alias;
        } else {
            $album->url_alias = str_replace(' ', '-', strtolower($request->name));
        }

        $success = $album->save();

        // Upload photos
        if (!empty($request->file('photos'))) {
            foreach ($request->file('photos') as $photo) {
                // Check if file with same name already exists in album.
                // If it doesn't, upload and save photo.
                $check_existing_photo = Photo::where('location', $album->_id . '/' . $photo->getClientOriginalName())->first();
                if (empty($check_existing_photo)) {
                    $stored_photo = new Photo;
                    $stored_photo->album_id = $album->_id;
                    $stored_photo->location = $photo->storeAs($album->_id, $photo->getClientOriginalName());

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
            return back()->with('message', 'Created new album');
        } else {
            return back()->withErrors('Something went wrong while trying to create a new album');
        }
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
        } catch (\Illuminate\Database\Eloqeunt\ModelNotFoundException $e) {
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
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $request->validate([
            '_id' => 'required',
            'name' => 'string|required',
            'album_id' => 'required',
            'cover_image' => 'image|nullable',
            'url_alias' => 'string|required',
            'photos' => 'array|nullable',
        ]);

        try {
            $album = Album::findOrFail($request->_id);

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
                    $check_existing_photo = Photo::where('location', $album->_id . '/' . $photo->getClientOriginalName())->first();
                    if (empty($check_existing_photo)) {
                        $stored_photo = new Photo;
                        $stored_photo->album_id = $album->_id;
                        $stored_photo->location = $photo->storeAs($album->_id, $photo->getClientOriginalName());

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
        } catch (\Illuminate\Database\Eloqeunt\ModelNotFoundException $e) {
            return back()->withErrors('Could not find album');
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Album  $album
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $request->validate([
            '_id' => 'required',
        ]);

        try {
            // Get album and photos to delete.
            $album = Album::where('_id', $request->_id)
                ->firstOrFail();

            // Iterate through photos and remove them.
            foreach ($album->photos as $photo) {
                $photo->delete();
            }

            // Set all child albums to root.
            $child_albums = Album::where('album_id', $album->_id)->get();
            foreach ($child_albums as $child) {
                $child->album_id = 0;
                $child->save();
            }

            // Finally, delete album.
            $album->delete();

            return back()->with('message', 'Removed album');
        } catch (\Illuminate\Database\Eloqeunt\ModelNotFoundException $e) {
            return back()->withErrors('Could not find album');
        }
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
        try {
            $album_db = Album::where('_id', $album_id)
                ->with(['photos'])
                ->firstOrFail();
            
            $zip = Zip::create("{$album_db->name}.zip");

            foreach ($album_db->photos as $photo) {
                if (!empty($photo->location)) {
                    $zip->add($photo->location);
                }
            }

            return $zip;
        } catch (\Illuminate\Database\Eloqeunt\ModelNotFoundException $e) {
            return back()->withErrors('Could not find album');
        }
    }

    /**
     * Turns albums flat array into tree.
     *
     * @param  \Illuminate\Database\Eloquent\Collection  $albums
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

                $children = $this->buildTree($albums, $album['_id']);
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
     * @param  \Illuminate\Support\Collection  $albums
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
}
