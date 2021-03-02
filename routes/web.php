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
Route::group(['prefix' => 'admin'], function () {
    Route::post('login', [AuthController::class, 'login']);
});

Route::group(['middleware' => 'auth', 'prefix' => 'admin'], function () {
    Route::post('album/create', [AlbumController::class, 'store']);
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
Route::get('/', [AlbumController::class, 'index']);
Route::get('/{alias}', [AlbumController::class, 'show'])->where('alias', '.*');
