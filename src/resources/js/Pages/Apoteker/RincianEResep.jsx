import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  ArrowRight, CalendarClock, CheckCircle2, ClipboardCheck, FileText, Info,
  Package, ShieldAlert, XCircle,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Modal from '../../Components/ui/Modal';
import StokObatModal from '../../Components/Apoteker/StokObatModal';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';
import { evaluasiStokObat } from '../../lib/evaluasiStokObat';

function formatTanggal(nilai) {
  if (!nilai) return 'Waktu resep tidak tersedia';

  const tanggal = new Date(nilai);
  if (Number.isNaN(tanggal.getTime())) return 'Waktu resep tidak tersedia';

  return tanggal.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toneStatus(status) {
  if (status === 'Ditolak') return 'danger';
  if (status === 'Siap Diserahkan' || status === 'Obat Sudah Diberikan') return 'success';
  if (status === 'Perlu Diracik') return 'info';
  if (status === 'Menunggu Telaah Resep') return 'warning';
  return 'neutral';
}

function DataField({ label, children }) {
  return (
    <div className="min-w-0 rounded-lg bg-white p-3">
      <small className="block text-[9px] font-medium text-ink-muted">{label}</small>
      <b className="mt-1 block break-words text-[12px] font-semibold text-ink">{children || 'Tidak tersedia'}</b>
    </div>
  );
}

function BagianNomor({ children }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-light-active text-[10px] font-bold text-brand-dark">
      {children}
    </span>
  );
}

export default function RincianEResep({ eresepId, resepServer }) {
  const resep = resepServer;
  const [identitasSesuai, setIdentitasSesuai] = useState(false);
  const [konselingDilakukan, setKonselingDilakukan] = useState(false);
  const [modalTolak, setModalTolak] = useState(false);
  const [modalStokBuka, setModalStokBuka] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [errorAlasan, setErrorAlasan] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusTersimpan, setStatusTersimpan] = useState(null);
  const statusResep = statusTersimpan ?? resep?.status;

  if (!resep) {
    return (
      <AppLayout role="apoteker" title="Pemeriksaan E-Resep" apotekerNotifikasi>
        <p className="rounded-xl bg-white p-6 text-sm text-ink-soft">
          Data E-Resep tidak ditemukan di database.
        </p>
      </AppLayout>
    );
  }

  const idResep = resep.id ?? resep.id_e_resep ?? eresepId;
  const daftarObat = Array.isArray(resep.items) ? resep.items : [];
  const evaluasiStok = daftarObat.map(evaluasiStokObat);
  const jumlahItem = daftarObat.length;
  const sudahDitolak = statusResep === 'Ditolak';
  const sudahSiap = statusResep === 'Siap Diserahkan';
  const sudahSelesai = statusResep === 'Obat Sudah Diberikan';
  const statusTidakDapatDisetujui = sudahDitolak || sudahSelesai;
  const stokCukupUntukResep = evaluasiStok.length > 0
    && evaluasiStok.every((status) => status.status === 'tersedia');
  const dapatLanjut = sudahSiap || (identitasSesuai && konselingDilakukan && stokCukupUntukResep);

  function setujuiResep() {
    if (sudahSiap) {
      router.visit(rute.apoteker.pengirimanObat(idResep));
      return;
    }

    if (!identitasSesuai || !konselingDilakukan) {
      toast.error('Verifikasi identitas dan konfirmasi konseling sebelum melanjutkan.');
      return;
    }

    if (!stokCukupUntukResep) {
      toast.error('Persetujuan ditahan karena stok resep tidak mencukupi atau datanya belum lengkap.');
      return;
    }

    setProcessing(true);
    router.post(`/apoteker/e-resep/${eresepId}/status`, { statusBaru: 'siap_diserahkan' }, {
      onSuccess: () => router.visit(rute.apoteker.pengirimanObat(idResep)),
      onError: () => toast.error('Status E-Resep gagal diperbarui.'),
      onFinish: () => setProcessing(false),
    });
  }

  function tolakResep() {
    const alasanBersih = alasan.trim();
    if (!alasanBersih) {
      setErrorAlasan('Alasan penolakan wajib diisi.');
      return;
    }

    setProcessing(true);
    router.post(`/apoteker/e-resep/${eresepId}/status`, {
      statusBaru: 'ditolak',
      alasanPenolakan: alasanBersih,
    }, {
      onSuccess: () => {
        setStatusTersimpan('Ditolak');
        setModalTolak(false);
        setErrorAlasan('');
      },
      onError: (errors) => {
        const pesan = errors.alasanPenolakan || 'Status E-Resep gagal diperbarui.';
        setErrorAlasan(pesan);
        toast.error(pesan);
      },
      onFinish: () => setProcessing(false),
    });
  }

  return (
    <AppLayout
      role="apoteker"
      title="Pemeriksaan E-Resep"
      apotekerNotifikasi
      contentClassName="pl-[21px] pr-[90px] max-[900px]:pl-5 max-[900px]:pr-5"
    >
      <div className="mx-auto w-full max-w-[897px] space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <Badge className="!px-[10px] !py-[3px] !text-[9px] !leading-3" tone="success">
                Farmasi Rawat Jalan
              </Badge>
              <span className="text-ink-muted">•</span>
              <span className="font-medium text-ink-soft">Telaah Resep Digital</span>
            </div>
            <h1 className="mt-1 text-[24px] font-bold leading-[30px] tracking-[-0.35px] text-ink sm:text-[27px]">
              Pengecekan &amp; Penyerahan Obat Pasien
            </h1>
            <p className="mt-1 max-w-[660px] text-[10px] leading-4 text-ink-muted">
              Verifikasi identitas pasien dan pemeriksaan kesesuaian obat sebelum diserahkan di loket farmasi.
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border-l-[5px] border-brand bg-white shadow-card" aria-label="Informasi E-Resep">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-low px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-md bg-brand-light-active text-brand-dark">
                <FileText className="size-4" />
              </span>
              <div>
                <small className="block text-[8px] font-bold uppercase tracking-[0.35px] text-ink-muted">
                  Nomor E-Resep Digital
                </small>
                <b className="mt-0.5 block text-[12px] font-bold text-ink">{idResep}</b>
              </div>
            </div>
            <Badge className="!px-2.5 !py-1 !text-[9px]" tone={toneStatus(statusResep)} dot>
              {statusResep || 'Status tidak tersedia'}
            </Badge>
          </div>

          <div className="grid gap-2.5 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
            <DataField label="Nama Pasien">{resep.pasien}</DataField>
            <DataField label="ID Pasien">{resep.pasienId ?? resep.id_pasien}</DataField>
            <DataField label="Dokter Penulis">{resep.dokter}</DataField>
            <DataField label="Waktu Simpan Resep">
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3 text-brand" />
                {formatTanggal(resep.tanggal)}
              </span>
            </DataField>
          </div>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-card sm:p-[18px]" aria-labelledby="identitas-heading">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <BagianNomor>1</BagianNomor>
              <h2 id="identitas-heading" className="text-[13px] font-bold text-ink">
                Verifikasi Identitas Pengambil Obat
              </h2>
            </div>
            <Badge className="!px-2 !py-1 !text-[8px]" tone="success">Wajib diperiksa</Badge>
          </div>

          <div className="mt-3 grid gap-2 rounded-lg bg-surface-mid p-2 sm:grid-cols-3">
            <DataField label="Nama Lengkap Pasien">{resep.pasien}</DataField>
            <DataField label="ID Pasien">{resep.pasienId ?? resep.id_pasien}</DataField>
            <DataField label="Tanggal Lahir / Usia">
              {resep.tanggal_lahir
                ? `${resep.tanggal_lahir}${resep.umur ? ` • ${resep.umur} tahun` : ''}`
                : 'Tidak tersedia pada data E-Resep'}
            </DataField>
          </div>

          <label className="mt-3 flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-ink-soft">
            <input
              type="checkbox"
              checked={identitasSesuai}
              onChange={(event) => setIdentitasSesuai(event.target.checked)}
              className="mt-0.5 size-3.5 shrink-0 accent-brand"
            />
            <span>Saya telah mencocokkan nama dan ID pasien dengan identitas pengambil obat.</span>
          </label>
          <p className="mt-1.5 pl-[22px] text-[9px] leading-4 text-ink-muted">
            Verifikasi ini hanya berlaku di sesi ini dan belum tersimpan sebagai audit di database.
          </p>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-card sm:p-[18px]" aria-labelledby="obat-heading">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <BagianNomor>2</BagianNomor>
              <div>
                <h2 id="obat-heading" className="text-[13px] font-bold text-ink">Pemeriksaan Kesesuaian Obat</h2>
                <p className="text-[9px] leading-4 text-ink-muted">Telaah obat, dosis, jumlah, dan aturan pakai.</p>
              </div>
            </div>
            <Badge className="!px-2 !py-1 !text-[8px]" tone="neutral">{jumlahItem} item obat</Badge>
          </div>

          <div className="mt-3 space-y-2">
            {daftarObat.map((item, index) => {
              const jumlah = item.jumlah_obat ?? item.satuan;
              const statusStokItem = evaluasiStok[index];

              return (
                <article key={`${item.id_obat ?? item.nama}-${index}`} className="rounded-lg bg-surface-mid p-3">
                  <div className="flex flex-wrap items-start gap-2.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-light-active text-brand-dark">
                      <ClipboardCheck className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] font-bold leading-4 text-ink">{item.nama || 'Nama obat tidak tersedia'}</h3>
                      <p className="text-[9px] leading-4 text-ink-muted">
                        {item.dosis || 'Dosis tidak tersedia'}
                        {' • '}
                        {jumlah !== null && jumlah !== undefined ? `${jumlah} unit` : 'Jumlah tidak tersedia'}
                      </p>
                      <p className="mt-1.5 flex items-start gap-1.5 text-[9px] leading-4 text-ink-soft">
                        <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-brand" />
                        <span><b className="font-semibold text-ink">Aturan Pakai:</b> {item.aturan || 'Tidak tersedia'}</span>
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[8px] text-ink-muted">
                          Stok tercatat: {statusStokItem.stokTercatat === null
                            ? 'Belum tersedia'
                            : `${statusStokItem.stokTercatat.toLocaleString('id-ID')} unit`}
                        </span>
                        <Badge className="!px-2 !py-[2px] !text-[8px] !leading-3" tone={statusStokItem.tone} dot>
                          {statusStokItem.label}
                        </Badge>
                        <span className="text-[8px] text-ink-muted">{statusStokItem.ringkasan}</span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      icon={Package}
                      size="sm"
                      className="h-[30px] shrink-0 px-3 text-[9px]"
                      onClick={() => setModalStokBuka(true)}
                    >
                      Stok Obat
                    </Button>
                  </div>
                </article>
              );
            })}
            {jumlahItem === 0 && (
              <p className="rounded-lg bg-surface-low p-4 text-center text-xs text-ink-muted">
                Data obat belum tersedia pada E-Resep ini.
              </p>
            )}
          </div>

          <label className="mt-2 flex cursor-pointer items-start gap-2 rounded-lg bg-brand-light-active p-2.5 text-[9px] leading-4 text-brand-dark">
            <input
              type="checkbox"
              checked={konselingDilakukan}
              onChange={(event) => setKonselingDilakukan(event.target.checked)}
              className="mt-0.5 size-3.5 shrink-0 accent-brand"
            />
            <span className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-brand-dark" />
              <span>
                Instruksi cara minum, efek samping, dan aturan penyimpanan obat telah dijelaskan kepada pasien atau perwakilan keluarga.
              </span>
            </span>
          </label>
          <p className="mt-1 flex items-start gap-1.5 text-[8px] leading-4 text-ink-muted">
            <Info className="mt-0.5 size-3 shrink-0" />
            Konseling ini hanya dikonfirmasi secara lokal dan belum tersimpan di database. Stok hanya informasi baca; alokasi tidak tersedia.
          </p>
        </section>

        {sudahDitolak && (
          <div className="flex gap-3 rounded-xl bg-danger-light p-4 text-xs text-danger" role="status">
            <ShieldAlert className="size-5 shrink-0" />
            <div>
              <b>Resep ditolak.</b>
              <p className="mt-1">{resep.alasan_penolakan || 'Alasan penolakan tidak tersedia.'}</p>
            </div>
          </div>
        )}

        {sudahSelesai && (
          <Badge tone="success" check>Obat sudah diberikan</Badge>
        )}

        <section className="rounded-xl bg-white p-3 shadow-card">
          {!identitasSesuai || !konselingDilakukan ? (
            <p className="mb-2 text-[9px] text-ink-muted">
              Centang verifikasi identitas dan konseling untuk mengaktifkan persetujuan.
            </p>
          ) : null}
          {!sudahSiap && !stokCukupUntukResep && !sudahDitolak && !sudahSelesai && (
            <p className="mb-2 rounded-lg bg-warning-light p-2.5 text-[9px] text-warning" role="status">
              Persetujuan ditahan sampai stok tercatat mencukupi seluruh jumlah resep. Ini pengamanan frontend; backend belum memvalidasi kecukupan maupun mengalokasikan stok.
            </p>
          )}
          <Button
            icon={ArrowRight}
            className="h-[36px] w-full justify-center text-[10px]"
            loading={processing}
            onClick={setujuiResep}
            disabled={processing || statusTidakDapatDisetujui || (!sudahSiap && !dapatLanjut)}
          >
            {sudahSiap ? 'Lanjut ke Penyerahan' : sudahSelesai ? 'Resep Selesai' : 'Selanjutnya'}
          </Button>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              icon={XCircle}
              size="sm"
              className="px-2 text-[9px] text-danger hover:bg-danger-light"
              onClick={() => {
                setErrorAlasan('');
                setModalTolak(true);
              }}
              disabled={processing || sudahDitolak || sudahSelesai}
            >
              Tolak Resep
            </Button>
            {!sudahDitolak && !sudahSelesai && !sudahSiap && (
              <p className="text-right text-[8px] text-ink-muted">
                Status berubah ke “Siap Diserahkan”; alokasi stok dan konseling tidak disimpan.
              </p>
            )}
          </div>
        </section>
      </div>

      <StokObatModal
        key={idResep}
        open={modalStokBuka}
        onClose={() => setModalStokBuka(false)}
        items={resep.items}
      />

      <Modal
        open={modalTolak}
        onClose={() => setModalTolak(false)}
        title="Tolak E-Resep"
        description="Alasan penolakan wajib diisi agar dapat ditindaklanjuti."
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalTolak(false)} disabled={processing}>
              Batal
            </Button>
            <Button variant="danger" icon={XCircle} loading={processing} onClick={tolakResep}>
              Konfirmasi Penolakan
            </Button>
          </>
        )}
      >
        <label className="block text-xs font-semibold text-ink">
          Alasan penolakan
          <textarea
            value={alasan}
            onChange={(event) => {
              setAlasan(event.target.value);
              setErrorAlasan('');
            }}
            maxLength={500}
            aria-invalid={Boolean(errorAlasan)}
            aria-describedby={errorAlasan ? 'alasan-penolakan-error' : undefined}
            className="mt-2 min-h-24 w-full rounded-lg bg-surface-low p-3 text-xs font-normal outline-none focus:ring-2 focus:ring-brand/30"
            placeholder="Jelaskan alasan penolakan..."
          />
        </label>
        <div className="mt-1 flex justify-between text-[10px] text-ink-muted">
          {errorAlasan
            ? <p id="alasan-penolakan-error" role="alert" className="text-danger">{errorAlasan}</p>
            : <span>Alasan wajib diisi, maksimal 500 karakter.</span>}
          <span>{alasan.length}/500</span>
        </div>
      </Modal>
    </AppLayout>
  );
}
