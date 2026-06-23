<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AdminTokenMiddleware
{
    /**
     * Protect admin-only API routes with an admins-table Sanctum token.
     */
    public function handle(Request $request, Closure $next)
    {
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $accessToken = PersonalAccessToken::findToken($bearerToken);
        $admin = $accessToken?->tokenable;

        if (!$accessToken || !$admin instanceof Admin) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->attributes->set('admin', $admin->withAccessToken($accessToken));

        return $next($request);
    }
}
