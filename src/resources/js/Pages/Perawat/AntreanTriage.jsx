import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Activity, CheckCircle2, Clock3, RefreshCw, Search } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import StatCard from '../../Components/ui/StatCard';
import { rute } from '../../lib/rute';

export default function AntreanTriage({ antrean = [] }) {
  const [kata, setKata] = useState('');
  const [poli, setPoli] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [kategori, setKategori] = useState('semua');

  const poliOptions = useMemo(() => Array.from(new Set(antrean.map((r) => r.poli).filter(Boolean))), [antrean]);

  const hasil = useMemo(() => antrean.filter((row) => {
    const q = kata.trim().toLowerCase();
    const cocokKat = kategori === 'semua' || row.kategori === kategori;
    const cocokPoli = poli === 'semua' || row.poli === poli;
    const sudah = Boolean(row.id_observasi);
    const cocokStat = filterStatus === 'semua' || (filterStatus === 'belum' && !sudah) || (filterStatus === 'selesai' && sudah);

    return cocokKat && cocokPoli && cocokStat && (!q || `${row.nama} ${row.rm} ${row.nik}`.toLowerCase().includes(q));
  }), [antrean, kata, poli, filterStatus, kategori]);

  const belumDiukur = antrean.filter((r) => !r.id_observasi).length;
  const sudahDiukur = antrean.filter((r) => r.id_observasi).length;

  return (
    <AppLayout role="perawat" title="Daftar Antrean Triage">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="success">UNIT RAWAT JALAN</Badge>
          <h1 className="mt-1.5 text-3xl font-extrabold text-ink">Daftar Antrean Triage Rawat Jalan</h1>
          <p className="mt-1 text-xs text-ink-soft">
            Pemeriksaan tanda-tanda vital dan skrining awal pasien sebelum masuk ruang periksa dokter spesialis.
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={() => router.reload({ only: ['antrean'] })}>
          Refresh Antrean
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="MENUNGGU PENGUKURAN" value={belumDiukur} unit="Pasien di lobi triage" icon={Clock3} />
        <StatCard label="TRIAGE SELESAI" value={sudahDiukur} unit="Siap masuk ruang poli" icon={CheckCircle2} tone="brand" />
        <StatCard label="TOTAL ANTREAN HARI INI" value={antrean.length} unit="Pasien terdaftar" icon={Activity} />
      </section>

      <section className="rounded-2xl bg-white shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={poli}
              onChange={(e) => setPoli(e.target.value)}
              className="h-9 rounded-xl bg-surface-input px-3 text-xs font-semibold outline-none"
            >
              <option value="semua">Semua Poli</option>
              {poliOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 rounded-xl bg-surface-input px-3 text-xs font-semibold outline-none"
            >
              <option value="semua">Semua Status Triage</option>
              <option value="belum">Belum Diukur</option>
              <option value="selesai">Triage Selesai</option>
            </select>
            <div className="flex gap-1">
              {['semua', 'Geriatri', 'Pediatri'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKategori(k)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                    kategori === k ? 'bg-brand-light-active text-brand-dark' : 'bg-surface-low text-ink-soft hover:bg-surface-mid'
                  }`}
                >
                  {k === 'semua' ? `Semua (${antrean.length})` : k}
                </button>
              ))}
            </div>
          </div>

          <label className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={kata}
              onChange={(e) => setKata(e.target.value)}
              placeholder="Cari nama pasien, No. RM..."
              className="h-9 w-full rounded-xl bg-surface-input pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-low text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3.5">No. Urut</th>
                <th className="px-4 py-3.5">Waktu</th>
                <th className="px-4 py-3.5">No. RM &amp; NIK</th>
                <th className="px-4 py-3.5">Nama Pasien</th>
                <th className="px-4 py-3.5">Poli Tujuan</th>
                <th className="px-4 py-3.5">Status Observasi</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {hasil.length > 0 ? hasil.map((row) => (
                <tr key={row.id} className="hover:bg-surface/60">
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-lg bg-brand-light-active px-2.5 py-1.5 text-xs font-extrabold text-brand-dark">
                      {row.no}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-ink">{row.jam} WIB</td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-ink">{row.rm}</p>
                    <p className="text-[10px] text-ink-muted">NIK: {row.nik}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-ink">{row.nama}</p>
                    <p className="text-[11px] text-ink-soft">{row.jk}, {row.umur} th</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone="neutral">{row.poli}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={row.id_observasi ? 'success' : 'warning'} dot>
                      {row.id_observasi ? `Triage Selesai (${row.tekanan_darah})` : 'Belum Diukur'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant={row.id_observasi ? 'outline' : 'primary'}
                      icon={Activity}
                      onClick={() => router.visit(rute.perawat.formObservasi(row.idReservasi))}
                    >
                      {row.id_observasi ? 'Edit Observasi' : 'Lakukan Observasi'}
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    Belum ada antrean pasien pada hari ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}
