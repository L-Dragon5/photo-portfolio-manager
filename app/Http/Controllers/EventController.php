<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use Inertia\Inertia;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = Event::orderBy('name', 'ASC')->get();

        return Inertia::render('Admin/Events', [
            'events' => $events,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventRequest $request)
    {
        Event::create([
            ...$request->validated(),
            'url_alias' => $this->nameToUrlAlias($request->name),
        ]);

        return to_route('events.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventRequest $request, Event $event)
    {
        $event->update($request->validated());

        return to_route('events.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        $event->delete();

        return to_route('events.index');
    }

    private function nameToUrlAlias($inputString)
    {
        return str_replace(' ', '-', str_replace('-', '', strtolower($inputString)));
    }
}
