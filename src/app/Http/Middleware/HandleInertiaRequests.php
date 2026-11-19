<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => function () use ($request) {
                    $id = $request->session()->get('user_id');
                    if (! $id) {
                        return null;
                    }
                    $user = DB::table('users')->where('id', $id)->first(['name', 'role']);
                    if (! $user) {
                        return null;
                    }

                    return [
                        'nama' => $user->name,
                        'peran' => ucfirst($user->role),
                        'role' => $user->role,
                    ];
                },
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'info' => fn () => $request->session()->get('info'),
                'profileUpdateResult' => fn () => $request->session()->get('profileUpdateResult'),
            ],
        ];
    }
}
