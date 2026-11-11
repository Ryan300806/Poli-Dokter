// MH-IM-003 | UI-014 | Halaman Antrean Periksa (Dashboard Dokter) | Penulis: MH
// Sumber desain: Figma node 240:1074. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-014).
// Rute: GET /dokter/antrean-periksa  (routes/fe/mh.php, nama rute dokter.antrean-periksa)
// Props dari BE (opsional, bila belum ada dipakai data contoh): { dokter, antrean }
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Stethoscope, Building2, CalendarDays, Radio, Users, ClipboardCheck, ClipboardClock, CheckCircle2,
  Search, RefreshCw, Clock, FolderOpen, Megaphone, FileText, Check,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import StatCard from '../../Components/ui/StatCard';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Modal from '../../Components/ui/Modal';
import Callout from '../../Components/ui/Callout';
import Pagination from '../../Components/ui/Pagination';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../Components/ui/Table';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';
import { cn } from '../../lib/cn';
import { inisial, tanggalHariIni } from '../../lib/format';
import { STATUS_PEMERIKSAAN, OPSI_FILTER_STATUS } from '../../lib/status';
import { antreanDummy, dokterContoh } from '../../data/antreanDummy';

const JUMLAH_PER_HALAMAN = 5;
const INTERVAL_SINKRON_DETIK = 30;

// Tekanan darah dianggap perlu perhatian bila sistolik >= 130 atau diastolik >= 90.
function tdPerluPerhatian(td) {
  const [sistol, diastol] = td.split('/').map(Number);
  return sistol >= 130 || diastol >= 90;
}

function KotakNomor({ no, status }) {
  const [huruf, angka] = no.split('-');
  const warna = {
    sedang: 'bg-brand text-white shadow-card',
    menunggu: 'bg-surface-high text-ink',
    selesai: 'bg-surface-mid text-ink-muted',
  }[status];
  return (
    <span className={cn('flex h-12 w-14 flex-col items-center justify-center rounded-lg text-base font-bold leading-6', warna)}>
      <span>{huruf}-</span><span>{angka}</span>
    </span>
  );
}

// Satu nilai tanda vital: label di atas, angka di bawah (sesuai Figma)
function Vital({ label, nilai, bahaya = false }) {
  return (
    <span className={cn('flex flex-col', bahaya ? 'font-semibold text-danger-strong' : 'text-ink-soft')}>
      <span>{label}</span><span className={bahaya ? '' : 'text-ink'}>{nilai}</span>
    </span>
  );
}

function SelTriage({ p }) {
  if (p.status === 'selesai') {
    return (
      <div className="flex flex-col items-start gap-1 text-[13px] text-ink-muted">
        <Badge tone="muted" check className="font-medium">{p.hasil}</Badge>
        <span>TD {p.td} <span className="mx-1">•</span> {p.tindakLanjut}</span>
      </div>
    );
  }
  const { td, nadi, suhu } = p.triage;
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge tone="success" check className="font-medium">Triage Selesai</Badge>
      <div className="flex items-center gap-2 text-[13px] leading-[18px] text-ink-soft">
        <Vital label="TD" nilai={td} bahaya={tdPerluPerhatian(td)} />
        <span className="text-ink-muted">•</span>
        <Vital label="Nadi" nilai={`${nadi}x/m`} />
        <span className="text-ink-muted">•</span>
        <Vital label="Suhu" nilai={`${suhu.toFixed(1)}°C`} />
      </div>
    </div>
  );
}

export default function AntreanPeriksa({ dokter = dokterContoh, antrean = antreanDummy }) {
  const [kata, setKata] = useState('');
  const [filter, setFilter] = useState('semua');
  const [halaman, setHalaman] = useState(1);
  const [memuat, setMemuat] = useState(false);
  const [dipanggil, setDipanggil] = useState(null); // pasien yang akan dipanggil (isi Modal konfirmasi)

  // Ringkasan untuk 4 kartu (dihitung dari seluruh antrean, bukan dari hasil filter)
  const ringkasan = useMemo(() => ({
    total: antrean.length,
    sedang: antrean.filter((p) => p.status === 'sedang').length,
    menunggu: antrean.filter((p) => p.status === 'menunggu').length,
    selesai: antrean.filter((p) => p.status === 'selesai').length,
  }), [antrean]);

  // Pencarian: nama, No. RM (Modul 2 juga menyebut NIK; tambahkan p.nik bila BE sudah mengirimnya)
  const terfilter = useMemo(() => {
    const q = kata.trim().toLowerCase();
    return antrean.filter((p) => (filter === 'semua' || p.status === filter)
      && (!q || p.nama.toLowerCase().includes(q) || p.rm.toLowerCase().includes(q)
        || (p.nik ?? '').includes(q)));
  }, [antrean, kata, filter]);

  const totalHalaman = Math.max(1, Math.ceil(terfilter.length / JUMLAH_PER_HALAMAN));
  const halamanAktif = Math.min(halaman, totalHalaman);
  const mulai = (halamanAktif - 1) * JUMLAH_PER_HALAMAN;
  const baris = terfilter.slice(mulai, mulai + JUMLAH_PER_HALAMAN);

  function muatUlang(senyap = false) {
    setMemuat(true);
    router.reload({
      only: ['antrean'],
      preserveScroll: true,
      onFinish: () => setMemuat(false),
      onSuccess: () => { if (!senyap) toast.success('Daftar antrean diperbarui.'); },
      onError: () => toast.error('Gagal memuat antrean, coba lagi.'),
    });
  }

  // Sinkronisasi otomatis tiap 30 detik (sesuai catatan di Figma)
  useEffect(() => {
    const id = setInterval(() => muatUlang(true), INTERVAL_SINKRON_DETIK * 1000);
    return () => clearInterval(id);
  }, []);

  function bukaRM(p) {
    router.visit(rute.dokter.riwayatMedis(p.id), {
      onError: () => toast.error('Gagal mengambil riwayat medis, coba lagi.'), // pesan dari Modul 2
    });
  }

  function konfirmasiPanggil() {
    toast.success(`Pasien ${dipanggil.no} atas nama ${dipanggil.nama} dipanggil ke ${dokter.ruang}.`);
    setDipanggil(null);
  }

  return (
    <AppLayout role="dokter" title="Antrean Periksa">
      <PageHeader
        icon={Stethoscope}
        title="Daftar Antrean Ruang Periksa"
        actions={(
          <>
            <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-card">
              <span className="relative flex size-2.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative size-2.5 rounded-full bg-brand" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.5px] text-brand">Poli aktif melayani</span>
            </span>
            <Button variant="outline" icon={Radio} onClick={() => toast.info('Layar antrean depan belum tersedia.')}>
              Layar Antrean Depan
            </Button>
          </>
        )}
      >
        <span className="font-semibold text-ink">{dokter.nama}</span>
        <span className="text-ink-muted">•</span>
        <span className="flex items-center gap-1 font-medium text-brand">
          <Building2 className="size-3" />{dokter.poli} ({dokter.ruang})
        </span>
        <span className="text-ink-muted">•</span>
        <span className="flex items-center gap-1"><CalendarDays className="size-3" />Hari Ini: {tanggalHariIni()}</span>
      </PageHeader>

      <section className="grid grid-cols-4 gap-4" aria-label="Ringkasan antrean">
        <StatCard label="Total Antrean" value={ringkasan.total} unit="pasien" icon={Users} />
        <StatCard label="Sedang Diperiksa" value={ringkasan.sedang} unit={`di ${dokter.ruang}`} icon={ClipboardCheck} tone="brand" />
        <StatCard label="Menunggu Giliran" value={ringkasan.menunggu} unit="di ruang tunggu" icon={ClipboardClock} />
        <StatCard label="Selesai Konsultasi" value={ringkasan.selesai} unit="terlayani" icon={CheckCircle2} />
      </section>

      <section className="rounded-2xl bg-white shadow-card">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="relative w-[448px] max-w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="search" value={kata} onChange={(e) => { setKata(e.target.value); setHalaman(1); }}
              placeholder="Cari nama pasien, No. RM..." aria-label="Cari pasien"
              className="h-10 w-full rounded-lg bg-surface-low pl-10 pr-3 text-[13px] placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter} onChange={(e) => { setFilter(e.target.value); setHalaman(1); }} aria-label="Filter status"
              className="h-10 rounded-lg bg-surface-low px-3 text-[13px] font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {OPSI_FILTER_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button type="button" aria-label="Muat ulang" onClick={() => muatUlang()} disabled={memuat}
              className="flex size-10 items-center justify-center rounded-lg bg-surface-low text-ink hover:bg-surface-mid disabled:opacity-60">
              <RefreshCw className={cn('size-4', memuat && 'animate-spin')} />
            </button>
            <span className="rounded-lg bg-surface-mid px-3 py-2 text-[10px] font-medium text-ink-soft">
              Menampilkan <b className="text-ink">{JUMLAH_PER_HALAMAN}</b> Pasien Teratas
            </span>
          </div>
        </div>

        <Table>
          <Thead>
            <Tr>
              <Th>No.<br />Antrean</Th>
              <Th>Waktu<br />Kedatangan</Th>
              <Th>No. RM</Th>
              <Th>Nama Pasien &amp; Info</Th>
              <Th>Status Triage / Vital Signs</Th>
              <Th>Status Antrean</Th>
              <Th className="text-right">Aksi Dokter</Th>
            </Tr>
          </Thead>
          <Tbody>
            {baris.length === 0 && (
              <Tr><Td colSpan={7} className="py-12 text-center text-[13px] text-ink-muted">
                Tidak ada pasien yang cocok dengan pencarian atau filter.
              </Td></Tr>
            )}
            {baris.map((p) => {
              const st = STATUS_PEMERIKSAAN[p.status];
              const selesai = p.status === 'selesai';
              const [jamKet1, ...jamKet2] = p.keterangan.split(' ');
              return (
                <Tr key={p.id} aktif={p.status === 'sedang'}>
                  <Td><KotakNomor no={p.no} status={p.status} /></Td>
                  <Td>
                    <div className="flex items-start gap-1.5">
                      {selesai ? <Check className="mt-1 size-3.5 text-ink-muted" /> : <Clock className="mt-1 size-3.5 text-brand" />}
                      <div className="text-sm font-semibold leading-5">
                        <p className={selesai ? 'text-ink-muted' : 'text-ink'}>{p.jam}<br />WIB</p>
                        <p className="text-[10px] font-normal leading-[14px] text-ink-muted">{jamKet1} {jamKet2.join(' ')}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <p className="text-[13px] font-semibold leading-[18px] text-ink">{p.rm}</p>
                    <p className="text-[10px] leading-[14px] text-ink-muted">{p.jaminan}</p>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                        p.status === 'sedang' ? 'bg-brand/20 text-brand' : 'bg-surface-mid text-ink-soft',
                        selesai && 'text-ink-muted',
                      )}>{inisial(p.nama)}</span>
                      <div>
                        <p className="whitespace-nowrap text-base font-semibold leading-6 text-ink">{p.nama}</p>
                        <p className="text-[13px] text-ink-soft">{p.jk} • {p.umur} tahun</p>
                      </div>
                    </div>
                  </Td>
                  <Td><SelTriage p={p} /></Td>
                  <Td><Badge tone={st.tone} dot={st.dot} check={st.check}>{st.label}</Badge></Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'sedang' && <Button icon={FolderOpen} onClick={() => bukaRM(p)}>Buka RM</Button>}
                      {p.status === 'menunggu' && (
                        <>
                          {p.id === antrean.find((x) => x.status === 'menunggu')?.id ? (
                            <>
                              <Button icon={Megaphone} onClick={() => setDipanggil(p)}>Panggil</Button>
                              <Button variant="secondary" aria-label={`Buka RM ${p.nama}`} onClick={() => bukaRM(p)}><FolderOpen className="size-4" /></Button>
                            </>
                          ) : (
                            <Button variant="secondary" icon={FolderOpen} onClick={() => bukaRM(p)}>Buka RM</Button>
                          )}
                        </>
                      )}
                      {selesai && <Button variant="secondary" icon={FileText} className="text-ink-soft" onClick={() => bukaRM(p)}>Resume Medis</Button>}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        <div className="flex items-center justify-between p-4">
          <p className="text-[13px] text-ink-soft">
            {terfilter.length === 0
              ? 'Tidak ada data antrean.'
              : `Menampilkan ${mulai + 1}-${mulai + baris.length} dari ${terfilter.length} total antrean poli hari ini`}
          </p>
          <Pagination halaman={halamanAktif} totalHalaman={totalHalaman} onUbah={setHalaman} />
        </div>
      </section>

      <Callout aside={`Sinkronisasi otomatis tiap ${INTERVAL_SINKRON_DETIK} dtk`}>
        Pasien yang telah menyelesaikan <b className="text-ink">Pemeriksaan Awal Triage</b> oleh Nakes akan otomatis naik statusnya
        dan dapat segera dipanggil ke {dokter.ruang}.
      </Callout>

      <Modal
        open={!!dipanggil} onClose={() => setDipanggil(null)} title="Panggil pasien?"
        description={dipanggil && `${dipanggil.no} • ${dipanggil.nama} (${dipanggil.rm})`}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setDipanggil(null)}>Batal</Button>
            <Button icon={Megaphone} onClick={konfirmasiPanggil}>Ya, Panggil</Button>
          </>
        )}
      >
        Pasien akan dipanggil ke {dokter.ruang}. Pastikan pemeriksaan pasien sebelumnya sudah selesai.
      </Modal>
    </AppLayout>
  );
}
