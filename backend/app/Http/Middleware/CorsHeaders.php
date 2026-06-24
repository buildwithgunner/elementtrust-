<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsHeaders
{
    /**
     * Force CORS headers onto API responses so browser requests from the
     * hosted frontend keep working even if the platform strips framework-level
     * headers on the way out.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->shouldHandle($request)) {
            return $next($request);
        }

        if ($request->isMethod('OPTIONS')) {
            return response('', 204)->withHeaders($this->headersFor($request));
        }

        $response = $next($request);

        foreach ($this->headersFor($request) as $name => $value) {
            $response->headers->set($name, $value);
        }

        return $response;
    }

    private function shouldHandle(Request $request): bool
    {
        return $request->is('api/*') || $request->is('sanctum/csrf-cookie');
    }

    private function headersFor(Request $request): array
    {
        $origin = $request->headers->get('Origin');

        if (! $origin || ! $this->isAllowedOrigin($origin)) {
            return [];
        }

        $requestHeaders = $request->headers->get('Access-Control-Request-Headers', 'Content-Type, Authorization, Accept');

        return [
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => $requestHeaders,
            'Access-Control-Max-Age' => '86400',
            'Vary' => 'Origin',
        ];
    }

    private function isAllowedOrigin(string $origin): bool
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', (string) env('FRONTEND_URLS', ''))));

        $defaultAllowed = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:8000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:8000',
        ];

        $allowedOrigins = array_merge($defaultAllowed, $allowedOrigins);

        if (in_array($origin, $allowedOrigins, true)) {
            return true;
        }

        return (bool) preg_match('#^https://([a-z0-9-]+\.)*vercel\.app$#i', $origin);
    }
}
