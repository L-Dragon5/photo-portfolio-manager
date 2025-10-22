<?php

declare(strict_types=1);

use App\Http\Controllers\CosplayerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', fn(Request $request) => $request->user());

Route::group(['middleware' => 'auth.basic', 'prefix' => 'admin'], function (): void {
    Route::get('/cosplayers', [CosplayerController::class, 'getAll']);
});
