<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    public function __construct(private readonly \Illuminate\Auth\AuthManager $authManager, private readonly \Illuminate\Routing\Redirector $redirector)
    {
    }
    /**
     * Handle an incoming request.
     *
     * @param  string|null  ...$guards
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$guards)
    {
        $guards = $guards === [] ? [null] : $guards;

        foreach ($guards as $guard) {
            if ($this->authManager->guard($guard)->check()) {
                return $this->redirector->to(RouteServiceProvider::HOME);
            }
        }

        return $next($request);
    }
}
