<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Create a new service provider instance.
     *
     * @param  \Illuminate\Contracts\Foundation\Application  $app
     * @return void
     */
    public function __construct($app, private readonly \Illuminate\Contracts\Broadcasting\Factory $factory)
    {
        parent::__construct($app);
    }
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->factory->routes();

        require base_path('routes/channels.php');
    }
}
