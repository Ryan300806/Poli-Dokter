// MF-IM-004 | UI-004 | Profile Pasien | Penulis: MF
// Sumber desain: Figma node 150:4826. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-004).
// Rute: GET /pasien/profil  (routes/fe/mf.php, nama rute: pasien.profil)
import { useState } from 'react';
import {
  ArrowRight, BadgeCheck, Check, ClipboardList, Contact, Copy, Mail, MapPin, Phone, RefreshCw, ShieldCheck, User, UserCog,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../Components/ui/Table';
import { toast } from '../../Components/ui/Toast';
import EditDataModal from '../../Components/Pasien/EditDataModal';
import { pasienContoh, riwayatKunjunganContoh } from '../../data/profilPasien';

// Kartu putih dengan kepala berlatar abu (pola yang dipakai ketiga kartu di halaman ini).
function Kartu({ ikon: Ikon, judul, aksi, footer, children }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      <header className="flex items-center justify-between gap-3 bg-surface-low px-5 py-4">
        <h2 className="flex items-center gap-3 text-base font-semibold text-ink">
          <Ikon className="size-5 shrink-0 text-brand" />
          {judul}
        </h2>
        {aksi && <div className="flex shrink-0 items-center gap-2">{aksi}</div>}
      </header>
      {children}
      {footer}
    </section>
  );
}

// Satu baris data demografis: label di kiri, nilai di kanan.
function BarisData({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/60 py-3 text-[13px] last:border-b-0">
      <span className="text-ink-soft">{label}</span>
      <span className="text-right font-medium text-ink">{children}</span>
    </div>
  );
}

// Props: data dari BE. Nilai awalnya data contoh supaya halaman tampil tanpa BE.
export default function Profil({ pasien = pasienContoh, riwayat = riwayatKunjunganContoh }) {
  const [modalBuka, setModalBuka] = useState(false);
  const { asuransi, kontakDarurat } = pasien;

  async function salinNik() {
    try {
      await navigator.clipboard.writeText(pasien.nik);
      toast.success('NIK Berhasil Disalin');
    } catch {
      toast.error('NIK Gagal Disalin');
    }
  }

  function panggilKontak() {
    // Panggilan langsung dari aplikasi disimulasikan dengan notifikasi sampai BE/telepon tersedia.
    toast.success(`Menghubungi ${kontakDarurat.nama}...`);
  }

  function lihatArsip() {
    // Halaman arsip lengkap (SIM-RS) belum ada di Modul 2.
    toast.error('Arsip rekam medis lengkap belum tersedia.');
  }

  return (
    <AppLayout role="pasien" title="Profile Pasien">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Profil Pasien Terintegrasi"
          actions={(
            <Button icon={UserCog} onClick={() => setModalBuka(true)}>Mutakhirkan Data Pasien</Button>
          )}
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
            <ClipboardList className="size-3.5" />
            Modul Data Pasien Terpusat
            <span className="font-medium text-ink-muted">· SIM-RS v4.2</span>
          </span>
          <Badge tone="success" icon={BadgeCheck} className="uppercase">Status: {pasien.statusBpjs}</Badge>
        </PageHeader>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Kolom kiri: Identifikasi Rekam Medis */}
          <Kartu
            ikon={Contact}
            judul="Identifikasi Rekam Medis"
            aksi={(
              <>
                <Badge tone="neutral" className="rounded-md">{pasien.noRm}</Badge>
                <Badge tone="success" className="uppercase">{pasien.statusRekam}</Badge>
              </>
            )}
            footer={(
              <p className="flex items-center gap-2 bg-surface-low px-5 py-3 text-[11px] font-medium text-ink-soft">
                <RefreshCw className="size-3.5 text-brand" />
                Sinkronisasi Dukcapil &amp; BPJS: {pasien.sinkronisasi}
              </p>
            )}
          >
            <div className="flex flex-col gap-4 p-5">
              {/* Foto, nama, NIK, No. KK */}
              <div className="flex gap-4 rounded-xl bg-surface-low p-4">
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  <span className="flex size-20 items-center justify-center rounded-xl bg-surface-mid text-ink-muted">
                    <User className="size-8" />
                  </span>
                  <span className="text-[10px] font-medium text-ink-muted">ID: {pasien.idPasien}</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Nama Lengkap Pasien</p>
                    <p className="text-xl font-bold leading-7 text-ink">{pasien.nama}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 text-[13px]">
                    <span className="text-[10px] font-medium text-ink-muted">NIK:</span>
                    <span className="flex items-center gap-1.5 font-semibold tracking-wide text-ink">
                      {pasien.nik}
                      <button
                        type="button"
                        onClick={salinNik}
                        aria-label="Salin NIK"
                        className="rounded p-0.5 text-ink-soft hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 text-[13px]">
                    <span className="text-[10px] font-medium text-ink-muted">No. KK:</span>
                    <span className="font-semibold tracking-wide text-ink">{pasien.noKk}</span>
                  </div>
                </div>
              </div>

              {/* Data demografis */}
              <div>
                <BarisData label="Tempat / Tgl Lahir">
                  {pasien.tempatLahir}, {pasien.tanggalLahir} ({pasien.usia})
                </BarisData>
                <BarisData label="Jenis Kelamin">{pasien.jenisKelamin}</BarisData>
                <BarisData label="Golongan Darah">
                  <Badge tone="danger" className="rounded-md">{pasien.golonganDarah}</Badge>
                </BarisData>
                <BarisData label="Agama">{pasien.agama}</BarisData>
                <BarisData label="Pekerjaan">{pasien.pekerjaan}</BarisData>
                <BarisData label="Status Pernikahan">{pasien.statusPernikahan}</BarisData>
              </div>

              {/* Kepesertaan asuransi */}
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-ink-soft">Kepesertaan Asuransi &amp; Jaminan</p>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-low px-3 py-2.5 text-[13px] font-medium text-ink">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-brand" />
                    {asuransi.jenis} - {asuransi.kelas}
                  </span>
                  <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-ink-soft">{asuransi.skema}</span>
                </div>
              </div>
            </div>
          </Kartu>

          {/* Kolom kanan: Domisili & Kontak + Riwayat Kunjungan */}
          <div className="flex flex-col gap-6">
            <Kartu
              ikon={MapPin}
              judul="Domisili & Kontak Pasien"
              aksi={<Badge tone="success" icon={BadgeCheck} className="uppercase">Data Terverifikasi</Badge>}
            >
              <div className="flex flex-col gap-4 p-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                    <span>Alamat Lengkap KTP &amp; Tinggal</span>
                    <span className="inline-flex items-center gap-1 normal-case text-brand">
                      <Check className="size-3" strokeWidth={3} />
                      Sesuai KTP
                    </span>
                  </div>
                  <p className="rounded-xl bg-surface-low p-4 text-lg leading-7 text-ink">{pasien.alamat}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-surface-low px-4 py-3">
                    <p className="text-[10px] font-medium text-ink-muted">Nomor Telepon / WhatsApp</p>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[13px] font-medium text-ink">
                      {pasien.telepon}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand">
                        <ShieldCheck className="size-3.5" />
                        OTP
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-surface-low px-4 py-3">
                    <p className="text-[10px] font-medium text-ink-muted">Alamat Surat Elektronik (Email)</p>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[13px] font-medium text-ink">
                      <span className="min-w-0 truncate">{pasien.email}</span>
                      <Mail className="size-4 shrink-0 text-ink-muted" />
                    </div>
                  </div>
                </div>

                {/* Kontak darurat */}
                <div className="flex flex-wrap items-center gap-4 rounded-xl bg-surface-low p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-mid text-brand">
                    <span className="text-xl font-bold leading-none">*</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                      Kontak Darurat (Emergency Contact)
                    </p>
                    <p className="text-base font-bold text-ink">{kontakDarurat.nama}</p>
                    <p className="text-[11px] text-ink-soft">
                      Hubungan: {kontakDarurat.hubungan} • {kontakDarurat.telepon}
                    </p>
                  </div>
                  <Button variant="secondary" icon={Phone} onClick={panggilKontak} className="bg-brand-light text-brand">
                    Panggil Kontak
                  </Button>
                </div>
              </div>
            </Kartu>

            <Kartu
              ikon={ClipboardList}
              judul="Riwayat Kunjungan Poliklinik"
              aksi={(
                <span className="rounded-full bg-surface-mid px-3 py-1.5 text-[10px] font-semibold text-ink-soft">
                  Total: {riwayat.total} Kunjungan Terdaftar
                </span>
              )}
              footer={(
                <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-low px-5 py-4 text-[11px] text-ink-soft">
                  <span className="max-w-[260px]">
                    Menampilkan {riwayat.daftar.length} kunjungan terbaru dari total {riwayat.total} arsip medis terdaftar
                  </span>
                  <button
                    type="button"
                    onClick={lihatArsip}
                    className="inline-flex items-center gap-2 text-left text-[13px] font-semibold text-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    Lihat Seluruh Arsip Rekam Medis (SIM-RS)
                    <ArrowRight className="size-4 shrink-0" />
                  </button>
                </div>
              )}
            >
              <Table>
                <Thead>
                  <Tr>
                    <Th className="px-5">Tanggal &amp; No. Reg</Th>
                    <Th>Unit Poliklinik</Th>
                    <Th>Dokter DPJP</Th>
                    <Th>Diagnosis Utama</Th>
                    <Th className="px-5">Tindakan / Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {riwayat.daftar.map((k) => (
                    <Tr key={k.id}>
                      <Td className="px-5">
                        <p className="text-[13px] font-bold text-ink">{k.tanggal}</p>
                        <p className="text-[10px] text-ink-muted">{k.noReg}</p>
                      </Td>
                      <Td>
                        <p className="text-[13px] font-medium text-ink">{k.poli}</p>
                        <p className="text-[10px] text-ink-muted">{k.lokasi}</p>
                      </Td>
                      <Td className="text-[13px] text-ink-soft">{k.dokter}</Td>
                      <Td>
                        <p className="text-[13px] font-medium text-ink">{k.diagnosis}</p>
                        <p className="text-[10px] text-ink-muted">ICD-10: {k.icd}</p>
                      </Td>
                      <Td className="px-5">
                        <Badge tone="success" className="uppercase">{k.status}</Badge>
                        <p className="mt-1 text-[10px] text-ink-muted">{k.tindakan}</p>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Kartu>
          </div>
        </div>
      </div>

      {/* Pop-up UI-005. Prop pasien disiapkan untuk form pemutakhiran. */}
      <EditDataModal open={modalBuka} onClose={() => setModalBuka(false)} pasien={pasien} />
    </AppLayout>
  );
}
