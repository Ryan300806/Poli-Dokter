// MF-IM-004 | Data contoh UI-004 Profil Pasien | Penulis: MF
// Isinya mengikuti Figma. BE nanti mengirim data asli lewat props dengan bentuk yang sama.

export const pasienContoh = {
  noRm: 'RM-009281',
  idPasien: 'P-9281-JKT',
  statusRekam: 'Aktif',
  statusBpjs: 'Terverifikasi BPJS',
  nama: 'Ny. Karina Chelsy',
  nik: '3175081406850003',
  noKk: '3175080201080045',
  tempatLahir: 'Jakarta',
  tanggalLahir: '14 Juni 1985',
  usia: '38 th',
  jenisKelamin: 'Perempuan',
  golonganDarah: 'O (Rh+)',
  agama: 'Kristen',
  pekerjaan: 'Karyawan Swasta',
  statusPernikahan: 'Kawin',
  asuransi: { jenis: 'BPJS Kesehatan', kelas: 'Kelas 1', skema: 'Mandiri' },
  sinkronisasi: '12 Mei 2024, 09:14 WIB',
  alamat: 'Jl. Cempaka Putih Timur No. 42, RT 005 / RW 03, Kel. Cempaka Putih Timur, Kec. Cempaka Putih, Jakarta Pusat, DKI Jakarta 10510',
  telepon: '+62 812-9847-2201',
  email: 'karinaaa85@email.com',
  kontakDarurat: { nama: 'Ny. Ratna Budiarti', hubungan: 'Ibu Kandung', telepon: '0813-1120-7749' },
};

export const riwayatKunjunganContoh = {
  total: 14,
  daftar: [
    {
      id: 1, tanggal: '24 Okt 2024', noReg: 'REG-2024-88219',
      poli: 'Poli Penyakit Dalam', lokasi: 'Gedung B, Lt. 2',
      dokter: 'dr. Hendra Gunawan, Sp.PD',
      diagnosis: 'Dispepsia Fungsional + Gastritis', icd: 'K30',
      status: 'Selesai', tindakan: 'Resep Obat Diambil',
    },
    {
      id: 2, tanggal: '14 Okt 2024', noReg: 'REG-2024-85401',
      poli: 'Poli Umum', lokasi: 'Gedung A, Lt. 1',
      dokter: 'dr. Siti Rahma',
      diagnosis: 'Faringitis Akut', icd: 'J02.9',
      status: 'Selesai', tindakan: 'Konsultasi Rutin',
    },
    {
      id: 3, tanggal: '03 Agu 2024', noReg: 'REG-2024-71289',
      poli: 'Poli Mata', lokasi: 'Gedung B, Lt. 1',
      dokter: 'dr. Farhan, Sp.M',
      diagnosis: 'Astigmatisme Miopia', icd: 'H52.2',
      status: 'Selesai', tindakan: 'Koreksi Refraksi',
    },
    {
      id: 4, tanggal: '19 Mei 2024', noReg: 'REG-2024-59124',
      poli: 'Poli Gigi & Mulut', lokasi: 'Gedung B, Lt. 2',
      dokter: 'drg. Rendy Setiawan',
      diagnosis: 'Pulpitis Reversibel Gigi 36', icd: 'K04.0',
      status: 'Selesai', tindakan: 'Tambalan Komposit',
    },
  ],
};