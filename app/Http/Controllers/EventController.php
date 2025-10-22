<?php

declare(strict_types=1);

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
        $events = \App\Models\Event::query()->orderBy('name', 'ASC')->get();

        return Inertia::render('Admin/Events', [
            'events' => $events,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventRequest $storeEventRequest)
    {
        \App\Models\Event::query()->create([
            ...$storeEventRequest->validated(),
            'url_alias' => $this->nameToUrlAlias($storeEventRequest->name),
        ]);

        return to_route('events.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventRequest $updateEventRequest, Event $event)
    {
        $event->update($updateEventRequest->validated());

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

    private function nameToUrlAlias($inputString): string
    {
        return str_replace(' ', '-', str_replace('-', '', strtolower((string) $inputString)));
    }
}
