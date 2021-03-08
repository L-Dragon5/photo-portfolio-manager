<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Album;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

        return Inertia::render('Public/Index', [
            'albums' => $albums,
        ])->withViewData(['title' => 'Home']);
    }

    /**
     * Display listing on admin page.
     * 
     * @return  \Illuminate\Http\Response
     */
    public function adminIndex() {
        $albums = Album::with(['photos'])->orderBy('name')->get();

        foreach ($albums as $album) {
            if ($album->album_id === 0) {
                $album->parent = '0 - Root';
            } else {
                $album->parent = $album->parentAlbum->name;
            }
        }

        $albums = $albums->sortBy('parent')->values()->all();

        // Get all available albums.
        $available_albums = [];
        foreach (Album::all() as $album) {
            $available_albums[] = ['id' => $album->id, 'name' => $album->name];
        }

        return Inertia::render('Admin/Index', [
            'albums' => $albums,
            'availableAlbums' => $available_albums,
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
            'album_id' => 'numeric|nullable',
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
                $check_existing_photo = Photo::where('location', $album->id . '/' . $photo->getClientOriginalName())->first();
                if (empty($check_existing_photo)) {
                    $stored_photo = new Photo;
                    $stored_photo->album_id = $album->id;
                    $stored_photo->location = $photo->storeAs($album->id, $photo->getClientOriginalName(), 'public');
                    
                    list($width, $height) = getimagesize($photo);
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
            $album = Album::where('url_alias', $url_alias)
                ->with(['albums', 'photos'])
                ->firstOrFail();
        } catch (\Illuminate\Database\Eloqeunt\ModelNotFoundException $e) {
            return back()->withErrors('Could not find album');
        }

        // Set landscape flag for child album cover images.
        foreach ($album->albums as $child) {
            // Set cover image path.
            $img = \Image::make(Storage::disk('public')->get($child->cover_image));
            $width = $img->width();
            $height = $img->height();
            if ($width > $height) {
                $child->is_landscape = true;
            } else {
                $child->is_landscape = false;
            }
        }

        // Create breadcrumbs.
        $title = $album->name;
        $breadcrumbs = [];
        foreach (array_reverse($aliases) as $alias) {
            $parentAlbum = Album::where('url_alias', $alias)->first();

            $title .= ' - ' . $parentAlbum->name;
            $breadcrumbs[] = ['url_alias' => $alias, 'name' => $parentAlbum->name];
        }

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
            'id' => 'numeric|required',
            'name' => 'string|required',
            'album_id' => 'numeric|required',
            'cover_image' => 'image|nullable',
            'url_alias' => 'string|required',
            'photos' => 'array|nullable',
        ]);

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
                if (Storage::disk('public')->put($path, $img->__toString())) {
                    $album->cover_image = $path;
                }

                // Delete old cover image if not placeholder.
                if ($old_image !== 'placeholder.webp') {
                    Storage::disk('public')->delete($old_image);
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
                        $stored_photo->location = $photo->storeAs($album->id, $photo->getClientOriginalName(), 'public');
                        
                        list($width, $height) = getimagesize($photo);
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
            'id' => 'numeric|required',
        ]);

        try {
            // Get album and photos to delete.
            $album = Album::where('id', $request->id)
                ->firstOrFail();

            // Iterate through photos and remove them.
            foreach ($album->photos as $photo) {
                $photo->delete();
            }

            // Set all child albums to root.
            $child_albums = Album::where('album_id', $album->id)->get();
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
     * @param   integer  $album
     * @return  \Illuminate\Http\Response
     */
    public function download($album) {
        try {
            $album = Album::where('id', $album)
                ->with(['photos'])
                ->firstOrFail();

            $zip = Zip::create("$album->name.zip");

            foreach ($album->photos as $photo) {
                $zip->add("storage/$photo->location");
            }

            return $zip;
        } catch (\Illuminate\Database\Eloqeunt\ModelNotFoundException $e) {
            return back()->withErrors('Could not find album');
        }
    }
}
