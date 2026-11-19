<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleSession
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->session()->get('user_id')) {
            return redirect()->route('login')->with('info', 'Silakan masuk terlebih dahulu.');
        }

        $roleAktif = mb_strtolower(trim((string) $request->session()->get('user_role')));
        $roleTujuan = mb_strtolower(trim($role));

        abort_unless(
            $roleAktif === $roleTujuan,
            403,
            'Akses ditolak. Peran akun Anda: '.($roleAktif ?: 'tidak diketahui').'; halaman ini memerlukan peran '.$roleTujuan.'.'
        );

        return $next($request);
    }
}
