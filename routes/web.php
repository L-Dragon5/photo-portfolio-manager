<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\CosplayerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Admin Routes
Route::group(['middleware' => 'auth.basic', 'prefix' => 'admin'], function () {
    Route::get('/', [AlbumController::class, 'index'])->name('admin-base');
    
    Route::resource('albums', AlbumController::class)->except([
        'index', 'create', 'edit', 'show',
    ]);
    Route::resource('events', EventController::class)->except([
        'create', 'edit',
    ]);
    Route::resource('cosplayers', CosplayerController::class)->except([
        'create', 'edit', 'show',
    ]);
});

// Public Routes
Route::get('/', [PublicController::class, 'index'])->name('home');
Route::get('/events', [PublicController::class, 'indexEvents'])->name('events');
Route::get('/events/{id}', [PublicController::class, 'showEvent']);
Route::get('/events/{id}/{alias}', [PublicController::class, 'showAlbum'])->where('alias', '.*');
Route::get('/on-location', [PublicController::class, 'indexLocation'])->name('on-location');
Route::get('/on-location/{alias}', [PublicController::class, 'showAlbum'])->where('alias', '.*');
Route::get('/press', [PublicController::class, 'indexPress'])->name('press');
Route::get('/press/{alias}', [PublicController::class, 'showAlbum'])->where('alias', '.*');

Route::get('/album-download/{album}', [PublicController::class, 'download']);

// Fallback
Route::fallback(function () {
    return redirect()->route('home');
});
