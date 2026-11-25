<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleSession
{
    public function handle(Request $request, Closure $next, string $role = 'pasien'): Response
    {
        $user = $request->user();
        if (! $user || ! $user->is_active) {
            if ($user) {
                Auth::logout();
            }
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('info', 'Silakan masuk untuk membuka layanan ini.');
        }
        abort_unless($user->role === $role, 403);

        // Laravel may have restored an authenticated patient from a remember token.
        if ((int) $request->session()->get('user_id') !== (int) $user->id
            || $request->session()->get('user_role') !== $role
            || ! $request->session()->has($role.'_id')) {
            $id = $user->idPelaku();
            abort_unless($id, 403);
            $request->session()->forget(['pasien_id', 'dokter_id', 'perawat_id', 'apoteker_id']);
            $request->session()->put(['user_id' => $user->id, 'user_role' => $role, $role.'_id' => $id]);
        }

        $response = $next($request);
        $response->headers->set('Cache-Control', 'private, no-store');

        return $response;
    }
}
