<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Create a new middleware instance.
     *
     * @param  \Illuminate\Contracts\Auth\Factory  $auth
     * @return void
     */
    public function __construct(\Illuminate\Contracts\Auth\Factory $auth, private readonly \Illuminate\Routing\UrlGenerator $urlGenerator)
    {
        parent::__construct($auth);
    }
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    #[\Override]
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
            return $this->urlGenerator->route('login');
        }
    }
}
