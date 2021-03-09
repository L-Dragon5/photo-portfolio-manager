<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\PhotoController;

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
Route::get('/album-download/{album}', [AlbumController::class, 'download']);

Route::group(['prefix' => 'admin'], function () {
    Route::post('login', [AuthController::class, 'login']);
});

Route::group(['middleware' => 'auth', 'prefix' => 'admin'], function () {
    Route::post('album/store', [AlbumController::class, 'store']);
    Route::post('album/update', [AlbumController::class, 'update']);
    Route::post('album/destroy', [AlbumController::class, 'destroy']);
    Route::post('photo/destroy', [PhotoController::class, 'destroy']);
});


/******************
 * Display Routes *
 ******************/
Route::group(['middleware' => 'auth', 'prefix' => 'admin'], function () {
    Route::get('/', [AlbumController::class, 'adminIndex'])->name('admin-base');
});

// Authentication Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');

// Public Routes
Route::get('/', [AlbumController::class, 'index'])->name('home');

// Redirects
Route::redirect('/misc-shoots/', '/location-shoots/');
Route::redirect('/misc-shoots/{param}', '/location-shoots/{param}');

// Base to get alias and display albums accordingly
Route::get('/{alias}', [AlbumController::class, 'show'])->where('alias', '.*');

// Fallback
Route::fallback(function () {
    return redirect()->route('home');
});
