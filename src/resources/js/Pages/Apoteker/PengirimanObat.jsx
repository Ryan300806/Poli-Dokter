import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  ArrowLeft, Check, CheckCircle2, ClipboardList, FileText, Info, PackageCheck, Printer, ShieldCheck, UserRound,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Modal from '../../Components/ui/Modal';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';

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

function DataField({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg bg-surface-low p-3.5">
      <small className="block text-[11px] font-medium text-ink-muted">{label}</small>
      <b className="mt-1.5 block break-words text-sm font-semibold leading-5 text-ink">{value || 'Tidak tersedia'}</b>
    </div>
  );
}

function statusObat(item) {
  const stok = Number(item.jumlah_stok);
  const jumlah = Number(item.jumlah_obat ?? item.satuan);

  if (item.jumlah_stok === null || item.jumlah_stok === undefined || item.jumlah_stok === ''
    || !Number.isSafeInteger(stok) || stok < 0
    || !Number.isSafeInteger(jumlah) || jumlah < 1) {
    return { label: 'Status stok tidak diketahui', tone: 'neutral' };
  }
  if (stok === 0) return { label: 'Tidak Tersedia', tone: 'danger' };
  if (stok < jumlah) return { label: 'Tidak Mencukupi', tone: 'warning' };
  return { label: 'Tersedia', tone: 'success' };
}

export default function PengirimanObat({ eresepId, eresepServer }) {
  const resep = eresepServer;
  const [identitasSesuai, setIdentitasSesuai] = useState(false);
  const [modalKonfirmasi, setModalKonfirmasi] = useState(false);
  const [processing, setProcessing] = useState(false);
  const sudahDiserahkan = resep?.status === 'Obat Sudah Diberikan';
  const items = Array.isArray(resep?.items) ? resep.items : [];
  const nomorResep = resep?.id ?? resep?.id_e_resep ?? eresepId;

  function konfirmasiPenyerahan() {
    if (!identitasSesuai) {
      toast.error('Centang verifikasi identitas pasien sebelum mengonfirmasi.');
      return;
    }

    if (!resep) {
      toast.error('Data resep tidak tersedia dari database.');
      return;
    }

    setProcessing(true);
    router.post(`/apoteker/e-resep/${eresepId}/status`, { statusBaru: 'selesai' }, {
      onSuccess: () => {
        setModalKonfirmasi(false);
        toast.success('Status penyerahan obat telah diperbarui.');
        router.visit(rute.apoteker.notifikasiEResep);
      },
      onError: () => toast.error('Status penyerahan gagal disimpan.'),
      onFinish: () => setProcessing(false),
    });
  }

  if (!resep) {
    return (
      <AppLayout role="apoteker" title="Ringkasan Penyerahan Obat">
        <p className="rounded-xl bg-white p-6 text-sm text-ink-soft">
          E-Resep tidak ditemukan di database.
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      role="apoteker"
      title="Ringkasan Penyerahan Obat"
      contentClassName="pl-3 pr-9 xl:pl-[27px] xl:pr-[100px]"
    >
      <div className="mx-auto w-full max-w-[1024px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => router.visit(rute.apoteker.rincianEResep(eresepId))}
          >
            Kembali ke Pemeriksaan
          </Button>
          <Badge tone={sudahDiserahkan ? 'success' : 'warning'} dot>
            {sudahDiserahkan ? 'Penyerahan tercatat' : 'Menunggu konfirmasi penyerahan'}
          </Badge>
        </div>

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">Farmasi Rawat Jalan</p>
            <h1 className="mt-1 text-[28px] font-bold leading-9 tracking-[-0.35px] text-ink sm:text-[30px]">
              Ringkasan Penyerahan Obat
            </h1>
            <p className="mt-1 max-w-[640px] text-sm leading-5 text-ink-muted">
              Tinjau data E-Resep dan obat sebelum mencatat penyerahan kepada pasien.
            </p>
          </div>
          <Button
            variant="outline"
            icon={Printer}
            size="lg"
            className="print:hidden"
            onClick={() => window.print()}
          >
            Cetak Ringkasan
          </Button>
        </header>

        <section className="overflow-hidden rounded-xl border-l-[5px] border-brand bg-white shadow-card" aria-label="Informasi E-Resep">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-low px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-white text-brand">
                <FileText className="size-5" />
              </span>
              <div>
                <small className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Nomor E-Resep</small>
                <b className="text-lg font-bold text-ink">{nomorResep || 'Tidak tersedia'}</b>
              </div>
            </div>
            <Badge tone={sudahDiserahkan ? 'success' : 'info'} dot>
              {sudahDiserahkan ? 'Obat sudah diberikan' : resep.status || 'Status tidak tersedia'}
            </Badge>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <DataField label="Nama Pasien" value={resep.pasien ?? resep.nama_pasien} />
            <DataField label="ID Pasien" value={resep.id_pasien ?? resep.pasienId} />
            <DataField label="Dokter Penulis" value={resep.dokter} />
            <DataField label="Waktu Resep" value={formatTanggal(resep.tanggal ?? resep.waktu_kirim)} />
          </div>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
          <div className="space-y-5">
            <section className="rounded-xl bg-white p-5 shadow-card" aria-labelledby="identitas-heading">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="identitas-heading" className="flex items-center gap-2 text-base font-bold text-ink">
                  <UserRound className="size-5 text-brand" />
                  Identitas Pengambil Obat
                </h2>
                <Badge tone="warning" className="!text-[11px]">Verifikasi saat penyerahan</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <DataField label="Nama Pasien" value={resep.pasien ?? resep.nama_pasien} />
                <DataField label="NIK" value={resep.nik} />
                <DataField label="Tanggal Lahir" value={resep.tanggal_lahir} />
              </div>
              <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm leading-5 text-ink-soft">
                <input
                  type="checkbox"
                  checked={identitasSesuai}
                  onChange={(event) => setIdentitasSesuai(event.target.checked)}
                  className="mt-0.5 size-4 accent-brand"
                />
                <span>Saya telah mencocokkan identitas pengambil obat dengan data pasien di atas.</span>
              </label>
              <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-ink-muted">
                <Info className="mt-0.5 size-4 shrink-0" />
                Verifikasi ini hanya berlaku di sesi ini; backend belum mencatat identitas pengambil.
              </p>
            </section>

            <section className="rounded-xl bg-white p-5 shadow-card" aria-labelledby="daftar-obat-heading">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="daftar-obat-heading" className="flex items-center gap-2 text-base font-bold text-ink">
                    <ClipboardList className="size-5 text-brand" />
                    Ringkasan Obat
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">Informasi sesuai item E-Resep dari database.</p>
                </div>
                <Badge tone="neutral">{items.length} item</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {items.map((item, index) => {
                  const status = statusObat(item);
                  const jumlah = item.jumlah_obat ?? item.satuan;

                  return (
                    <article
                      key={`${item.id_obat ?? item.nama}-${index}`}
                      className="rounded-xl border border-line bg-white p-4 shadow-sm sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-base font-bold leading-6 text-ink">
                            {item.nama || item.nama_obat || 'Nama obat tidak tersedia'}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-ink-muted">{item.dosis || 'Dosis tidak tersedia'}</p>
                        </div>
                        <Badge tone={status.tone} dot className="!text-[11px]">{status.label}</Badge>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <DataField label="Jumlah Resep" value={jumlah === null || jumlah === undefined ? null : `${jumlah} unit`} />
                        <DataField label="Aturan Pakai" value={item.aturan ?? item.aturan_pakai} />
                        <DataField
                          label="Stok Tercatat"
                          value={item.jumlah_stok === null || item.jumlah_stok === undefined
                            ? 'Belum tersedia'
                            : `${Number(item.jumlah_stok).toLocaleString('id-ID')} unit`}
                        />
                      </div>
                    </article>
                  );
                })}
                {items.length === 0 && (
                  <p className="rounded-lg bg-surface-low p-5 text-center text-sm text-ink-muted">
                    Data item obat tidak tersedia pada E-Resep ini.
                  </p>
                )}
              </div>
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-info-light p-4 text-xs leading-5 text-ink-soft">
                <Info className="mt-0.5 size-4 shrink-0 text-info" />
                Status stok hanya informasi agregat dari data backend. Batch, alokasi, dan pengurangan stok tidak tersedia pada alur ini.
              </p>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-xl border-t-4 border-brand bg-white p-5 shadow-card" aria-labelledby="ringkasan-heading">
              <h2 id="ringkasan-heading" className="flex items-center gap-2 text-base font-bold text-ink">
                <ShieldCheck className="size-5 text-brand" />
                Ringkasan Penyerahan
              </h2>
              <p className="mt-1 text-xs leading-5 text-ink-muted">Rincian yang dapat diverifikasi dari data saat ini.</p>
              <dl className="mt-4 divide-y divide-line text-xs">
                <div className="flex justify-between gap-3 py-3.5">
                  <dt className="text-ink-muted">Status penyiapan</dt>
                  <dd className="text-right font-semibold text-ink">{resep.status || 'Tidak tersedia'}</dd>
                </div>
                <div className="flex justify-between gap-3 py-3.5">
                  <dt className="text-ink-muted">Jumlah item resep</dt>
                  <dd className="font-semibold text-ink">{items.length}</dd>
                </div>
                <div className="flex justify-between gap-3 py-3.5">
                  <dt className="text-ink-muted">Apoteker / petugas</dt>
                  <dd className="text-right font-semibold text-ink">Tidak tersedia pada backend</dd>
                </div>
                <div className="flex justify-between gap-3 py-3.5">
                  <dt className="text-ink-muted">Loket / tarif / penjamin</dt>
                  <dd className="text-right font-semibold text-ink">Tidak tersedia pada backend</dd>
                </div>
              </dl>
              <div className={`mt-3 rounded-lg p-4 text-xs leading-5 ${sudahDiserahkan ? 'bg-brand-light-active text-brand-dark' : 'bg-warning-light text-warning'}`} role="status">
                <PackageCheck className="mr-1.5 inline size-4" />
                {sudahDiserahkan
                  ? 'Status database mencatat resep sebagai obat sudah diberikan.'
                  : 'Konfirmasi akan memperbarui status E-Resep; backend belum menyimpan rincian serah-terima.'}
              </div>
              <Button
                size="lg"
                className="mt-4 min-h-12 w-full print:hidden"
                icon={CheckCircle2}
                onClick={() => setModalKonfirmasi(true)}
                disabled={sudahDiserahkan || processing}
              >
                {sudahDiserahkan ? 'Penyerahan Selesai' : 'Konfirmasi Penyerahan'}
              </Button>
            </section>

            <section className="rounded-xl bg-surface-low p-5 text-xs leading-5 text-ink-soft">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Info className="size-4 text-info" />
                Informasi Backend
              </h2>
              <p className="mt-2">
                Nama petugas, tanda tangan, loket, tarif, penjamin, dan catatan serah-terima belum tersedia dari backend. Ringkasan cetak tidak menambahkan nilai pengganti.
              </p>
            </section>
          </aside>
        </div>

        <div className="hidden print:block">
          <p className="text-xs text-ink-muted">
            Ringkasan ini dicetak dari data E-Resep. Tidak termasuk tanda tangan atau rincian petugas yang tidak tersedia pada sistem.
          </p>
        </div>
      </div>

      <Modal
        open={modalKonfirmasi}
        onClose={() => setModalKonfirmasi(false)}
        title="Konfirmasi Penyerahan Obat"
        description={`E-Resep ${nomorResep} · ${resep.pasien ?? resep.nama_pasien ?? 'Pasien'}`}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalKonfirmasi(false)} disabled={processing}>
              Batal
            </Button>
            <Button
              icon={Check}
              loading={processing}
              disabled={!identitasSesuai || processing}
              onClick={konfirmasiPenyerahan}
            >
              Catat Status Selesai
            </Button>
          </>
        )}
      >
        Pastikan obat telah diserahkan dan identitas pengambil telah dicocokkan. Sistem hanya akan memperbarui status E-Resep menjadi selesai; rincian alokasi atau serah-terima tidak disimpan.
      </Modal>
    </AppLayout>
  );
}
