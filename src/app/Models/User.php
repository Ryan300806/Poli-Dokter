<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function tujuanPortal(): ?string
    {
        return match ($this->role) {
            'pasien' => 'pasien.beranda',
            'dokter' => 'dokter.antrean-periksa',
            'perawat' => 'perawat.antrean-triage',
            'apoteker' => 'apoteker.notifikasi-eresep',
            default => null,
        };
    }

    public function idPelaku(): ?int
    {
        if (! $this->tujuanPortal()) {
            return null;
        }
        $id = \Illuminate\Support\Facades\DB::table($this->role)->where('user_id', $this->id)->value('id_'.$this->role);

        return $id ? (int) $id : null;
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }
}
