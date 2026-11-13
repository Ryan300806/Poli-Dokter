import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
  const routes = [
    {
      kategori: 'Autentikasi (Auth)',
      items: [
        { label: 'UI-002: Login', url: '/login', desc: 'Halaman masuk sistem' },
        { label: 'UI-001: Registrasi Pasien', url: '/registrasi', desc: 'Pendaftaran pasien baru' },
      ],
    },
    {
      kategori: 'Dokter',
      items: [
        { label: 'UI-014: Antrean Periksa', url: '/dokter/antrean-periksa', desc: 'Daftar antrean pasien periksa (Contoh Lengkap)' },
        { label: 'UI-009: Jadwal Saya', url: '/dokter/jadwal-saya', desc: 'Jadwal dokter & tambah slot' },
        { label: 'UI-015: Riwayat Medis', url: '/dokter/riwayat-medis/1', desc: 'Rekam medis pasien' },
        { label: 'UI-011: Form Diagnosis', url: '/dokter/form-diagnosis/1', desc: 'Input diagnosis pasien' },
        { label: 'UI-020: Form E-Resep', url: '/dokter/form-eresep/1', desc: 'Resep obat elektronik' },
      ],
    },
    {
      kategori: 'Pasien',
      items: [
        { label: 'UI-003: Beranda Pasien', url: '/pasien/beranda', desc: 'Portal utama pasien' },
        { label: 'UI-004: Profil Pasien', url: '/pasien/profil', desc: 'Informasi data diri pasien' },
        { label: 'UI-007: Penjadwalan Poli', url: '/pasien/penjadwalan-poli', desc: 'Booking dokter poli' },
        { label: 'UI-008: Riwayat Reservasi', url: '/pasien/riwayat-reservasi', desc: 'Tiket antrean & status' },
        { label: 'UI-010: Dasbor Pasien', url: '/pasien/dasbor', desc: 'Dasbor pasien' },
        { label: 'UI-012: Jadwal Saya', url: '/pasien/jadwal-saya', desc: 'Ubah atau batalkan jadwal' },
      ],
    },
    {
      kategori: 'Perawat',
      items: [
        { label: 'UI-006: Triage Perawat', url: '/perawat/triage', desc: 'Skrining awal kegawatdaruratan' },
        { label: 'UI-016: Antrean Triage', url: '/perawat/antrean-triage', desc: 'Daftar antrean observasi awal' },
        { label: 'UI-017: Form Observasi', url: '/perawat/form-observasi/1', desc: 'Input TTV (TD, Suhu, BB)' },
      ],
    },
    {
      kategori: 'Apoteker',
      items: [
        { label: 'UI-021: Notifikasi E-Resep', url: '/apoteker/notifikasi-eresep', desc: 'Daftar resep obat masuk' },
        { label: 'UI-022: Rincian E-Resep', url: '/apoteker/rincian-eresep/1', desc: 'Cek ketersediaan obat' },
        { label: 'UI-023: Pengiriman Obat', url: '/apoteker/pengiriman-obat/1', desc: 'Status serah terima obat' },
      ],
    },
  ];

  return (
    <>
      <Head title="Outpatient Care - Katalog Halaman FE" />
      <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                +
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Outpatient Care — MVP Frontend
              </h1>
            </div>
            <p className="text-slate-600 text-base">
              Katalog pengujian antarmuka (UI-001 s/d UI-023). Klik salah satu rute di bawah untuk membuka halaman.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map((group) => (
              <div key={group.kategori} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>{group.kategori}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {group.items.length} Halaman
                  </span>
                </h2>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      className="block p-3 rounded-lg border border-slate-100 hover:border-blue-400 hover:bg-blue-50/50 transition duration-150 group"
                    >
                      <div className="font-semibold text-blue-600 group-hover:text-blue-800 text-sm">
                        {item.label} &rarr;
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-12 text-center text-xs text-slate-400">
            Sistem Informasi Pasien Terintegrasi (Rawat Jalan / Poli) &bull; Inertia + React + Tailwind CSS
          </footer>
        </div>
      </div>
    </>
  );
}

