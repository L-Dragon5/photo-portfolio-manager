<?php

namespace App\Providers;

use Hammerstone\Sidecar\Inertia\SidecarGateway;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // Use Sidecar to run Inertia SSR.
        $this->app->instance(Gateway::class, new SidecarGateway);
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
