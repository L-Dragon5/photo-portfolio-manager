<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Album;
use Illuminate\Http\Request;

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
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Album  $album
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
            return back()->withErrors('Could not find location');
        }

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
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Album  $album
     * @return \Illuminate\Http\Response
     */
    public function edit(Album $album)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Album  $album
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Album $album)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Album  $album
     * @return \Illuminate\Http\Response
     */
    public function destroy(Album $album)
    {
        //
    }
}
