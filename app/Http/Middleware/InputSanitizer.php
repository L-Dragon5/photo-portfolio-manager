<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class InputSanitizer
{
    /**
     * Handle an incoming request.
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $input = $request->all();

        array_walk_recursive($input, function (&$input): void {
            $input = strip_tags((string) $input);
            $input = trim($input);
        });

        $request->merge($input);

        return $next($request);
    }
}
