<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PublicController;
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

/***************
 * Form Routes *
 ***************/
Route::get('/album-download/{album}', [PublicController::class, 'download']);

Route::group(['middleware' => 'auth.basic', 'prefix' => 'admin'], function () {
    Route::post('album/store', [AlbumController::class, 'store']);
    Route::post('album/update', [AlbumController::class, 'update']);
    Route::post('album/destroy', [AlbumController::class, 'destroy']);
    Route::post('photo/destroy', [PhotoController::class, 'destroy']);

    Route::resource('events', EventController::class)->except([
        'create', 'edit'
    ]);
});

/******************
 * Display Routes *
 ******************/
Route::group(['middleware' => 'auth.basic', 'prefix' => 'admin'], function () {
    Route::get('/', [AlbumController::class, 'adminIndex'])->name('admin-base');
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

// Redirects
Route::redirect('/misc-shoots/', '/location-shoots/');
Route::redirect('/misc-shoots/{param}', '/location-shoots/{param}');

// Base to get alias and display albums accordingly
Route::get('/{alias}', [AlbumController::class, 'show'])->where('alias', '.*');

// Fallback
Route::fallback(function () {
    return redirect()->route('home');
});
