<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => fn () => ['user' => $request->user() ? [
                'nama' => $request->user()->name,
                'peran' => ucfirst($request->user()->role),
                'role' => $request->user()->role,
            ] : null],
            'flash' => fn () => $request->session()->only(['success', 'info', 'profileUpdateResult', 'bookingSuccess']),
        ];
    }
}
