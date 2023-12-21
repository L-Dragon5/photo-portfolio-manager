<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCosplayerRequest;
use App\Http\Requests\UpdateCosplayerRequest;
use App\Models\Cosplayer;
use Inertia\Inertia;

class CosplayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cosplayers = Cosplayer::orderBy('name', 'ASC')->get();

        return Inertia::render('Admin/Cosplayers', [
            'cosplayers' => $cosplayers,
        ]);
    }

    public function getAll()
    {
        $cosplayers = Cosplayer::orderBy('name', 'ASC')->get();
        return json_encode($cosplayers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCosplayerRequest $request)
    {
        Cosplayer::create($request->validated());

        return to_route('cosplayers.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCosplayerRequest $request, Cosplayer $cosplayer)
    {
        $cosplayer->update($request->validated());

        return to_route('cosplayers.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cosplayer $cosplayer)
    {
        $cosplayer->delete();

        return to_route('cosplayers.index');
    }
}
