<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PhotoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
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
     * @param  \App\Models\Photo  $photo
     * @return \Illuminate\Http\Response
     */
    public function show(Photo $photo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Photo  $photo
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Photo $photo)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $request->validate([
            '_id' => 'numeric|required',
        ]);

        try {
            // Get photo to delete.
            $photo = Photo::where('_id', $request->_id)
                ->firstOrFail();

            // Delete photo object and entry from DB.
            $photo->delete();

            return back()->with('message', 'Removed photo');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->withErrors('Could not find photo');
        }
    }

    /**
     * Send download link for photo.
     *
     * @param  string  $photo
     * @return  \Illuminate\Http\Response
     */
    public function download($photo)
    {
        $photo_id = is_numeric($photo) ? intval($photo) : $photo;
        try {
            $photo_db = Photo::where('_id', $photo_id)
                ->firstOrFail();

            return file_get_contents($photo_db->location);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->withErrors('Could not find album');
        }
    }
}
