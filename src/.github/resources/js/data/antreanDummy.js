// data/antreanDummy.js
// DATA CONTOH untuk UI-014 saat BE belum siap. Bentuk datanya sama dengan yang nanti dikirim BE lewat props.
// Jika BE sudah mengirim props `antrean`, halaman otomatis memakai data BE dan file ini diabaikan.
// Field wajib per pasien: id, no, jam, keterangan, rm, jaminan, nama, jk, umur, status, triage.
// status: 'menunggu' | 'sedang' | 'selesai'. triage: {td, nadi, suhu} atau null (untuk status selesai).
export const dokterContoh = {
  nama: 'dr. Andi Pratama, Sp.PD',
  poli: 'Poli Penyakit Dalam',
  ruang: 'Ruang 204',
};

export const antreanDummy = [
  {
    "id": 1,
    "no": "A-012",
    "jam": "08:45",
    "keterangan": "Hadir tepat waktu",
    "rm": "RM-092144",
    "jaminan": "BPJS Kesehatan",
    "nama": "Budi Santoso",
    "jk": "Laki-laki",
    "umur": 45,
    "status": "sedang",
    "triage": {
      "td": "120/80",
      "nadi": 78,
      "suhu": 36.6
    }
  },
  {
    "id": 2,
    "no": "A-013",
    "jam": "08:58",
    "keterangan": "Menunggu 18 mnt",
    "rm": "RM-048219",
    "jaminan": "Umum / Pribadi",
    "nama": "Siti Rahmawati",
    "jk": "Perempuan",
    "umur": 32,
    "status": "menunggu",
    "triage": {
      "td": "135/85",
      "nadi": 84,
      "suhu": 37.0
    }
  },
  {
    "id": 3,
    "no": "A-014",
    "jam": "09:05",
    "keterangan": "Menunggu 11 mnt",
    "rm": "RM-104921",
    "jaminan": "BPJS Kesehatan",
    "nama": "Ahmad Zaki",
    "jk": "Laki-laki",
    "umur": 28,
    "status": "menunggu",
    "triage": {
      "td": "118/78",
      "nadi": 72,
      "suhu": 36.4
    }
  },
  {
    "id": 4,
    "no": "A-015",
    "jam": "09:12",
    "keterangan": "Menunggu 4 mnt",
    "rm": "RM-077532",
    "jaminan": "Asuransi Astra",
    "nama": "Dewi Lestari",
    "jk": "Perempuan",
    "umur": 51,
    "status": "menunggu",
    "triage": {
      "td": "125/82",
      "nadi": 80,
      "suhu": 36.8
    }
  },
  {
    "id": 5,
    "no": "A-011",
    "jam": "08:15",
    "keterangan": "Selesai 08:42",
    "rm": "RM-021940",
    "jaminan": "BPJS Kesehatan",
    "nama": "Hendra Wijaya",
    "jk": "Laki-laki",
    "umur": 59,
    "status": "selesai",
    "triage": null,
    "hasil": "Resep & Rujukan Terbit",
    "td": "130/85",
    "tindakLanjut": "Kontrol Rutin"
  },
  {
    "id": 6,
    "no": "A-016",
    "jam": "09:15",
    "keterangan": "Baru tiba",
    "rm": "RM-102192",
    "jaminan": "BPJS Kesehatan",
    "nama": "Rudi Hartono",
    "jk": "Laki-laki",
    "umur": 40,
    "status": "menunggu",
    "triage": {
      "td": "118/76",
      "nadi": 70,
      "suhu": 36.4
    }
  },
  {
    "id": 7,
    "no": "A-017",
    "jam": "09:17",
    "keterangan": "Baru tiba",
    "rm": "RM-102329",
    "jaminan": "Umum / Pribadi",
    "nama": "Maya Sari",
    "jk": "Perempuan",
    "umur": 36,
    "status": "menunggu",
    "triage": {
      "td": "121/78",
      "nadi": 71,
      "suhu": 36.6
    }
  },
  {
    "id": 8,
    "no": "A-018",
    "jam": "09:19",
    "keterangan": "Baru tiba",
    "rm": "RM-102466",
    "jaminan": "BPJS Kesehatan",
    "nama": "Tono Wibowo",
    "jk": "Laki-laki",
    "umur": 62,
    "status": "menunggu",
    "triage": {
      "td": "124/80",
      "nadi": 72,
      "suhu": 36.8
    }
  },
  {
    "id": 9,
    "no": "A-019",
    "jam": "09:21",
    "keterangan": "Baru tiba",
    "rm": "RM-102603",
    "jaminan": "Umum / Pribadi",
    "nama": "Lia Anggraini",
    "jk": "Perempuan",
    "umur": 27,
    "status": "menunggu",
    "triage": {
      "td": "127/82",
      "nadi": 73,
      "suhu": 37.0
    }
  },
  {
    "id": 10,
    "no": "A-020",
    "jam": "09:23",
    "keterangan": "Baru tiba",
    "rm": "RM-102740",
    "jaminan": "BPJS Kesehatan",
    "nama": "Bagus Prakoso",
    "jk": "Laki-laki",
    "umur": 33,
    "status": "menunggu",
    "triage": {
      "td": "130/76",
      "nadi": 74,
      "suhu": 37.2
    }
  },
  {
    "id": 11,
    "no": "A-021",
    "jam": "09:25",
    "keterangan": "Baru tiba",
    "rm": "RM-102877",
    "jaminan": "Umum / Pribadi",
    "nama": "Nina Kartika",
    "jk": "Perempuan",
    "umur": 48,
    "status": "menunggu",
    "triage": {
      "td": "118/78",
      "nadi": 75,
      "suhu": 36.4
    }
  },
  {
    "id": 12,
    "no": "A-022",
    "jam": "09:27",
    "keterangan": "Baru tiba",
    "rm": "RM-103014",
    "jaminan": "BPJS Kesehatan",
    "nama": "Eko Saputra",
    "jk": "Laki-laki",
    "umur": 55,
    "status": "menunggu",
    "triage": {
      "td": "121/80",
      "nadi": 76,
      "suhu": 36.6
    }
  },
  {
    "id": 13,
    "no": "A-023",
    "jam": "09:29",
    "keterangan": "Baru tiba",
    "rm": "RM-103151",
    "jaminan": "Umum / Pribadi",
    "nama": "Fitri Handayani",
    "jk": "Perempuan",
    "umur": 30,
    "status": "menunggu",
    "triage": {
      "td": "124/82",
      "nadi": 77,
      "suhu": 36.8
    }
  },
  {
    "id": 14,
    "no": "A-024",
    "jam": "09:31",
    "keterangan": "Baru tiba",
    "rm": "RM-103288",
    "jaminan": "BPJS Kesehatan",
    "nama": "Yusuf Maulana",
    "jk": "Laki-laki",
    "umur": 41,
    "status": "menunggu",
    "triage": {
      "td": "127/76",
      "nadi": 78,
      "suhu": 37.0
    }
  },
  {
    "id": 15,
    "no": "A-025",
    "jam": "09:33",
    "keterangan": "Baru tiba",
    "rm": "RM-103425",
    "jaminan": "Umum / Pribadi",
    "nama": "Rina Oktaviani",
    "jk": "Perempuan",
    "umur": 38,
    "status": "menunggu",
    "triage": {
      "td": "130/78",
      "nadi": 70,
      "suhu": 37.2
    }
  },
  {
    "id": 16,
    "no": "A-026",
    "jam": "09:35",
    "keterangan": "Baru tiba",
    "rm": "RM-103562",
    "jaminan": "BPJS Kesehatan",
    "nama": "Dedi Gunawan",
    "jk": "Laki-laki",
    "umur": 64,
    "status": "menunggu",
    "triage": {
      "td": "118/80",
      "nadi": 71,
      "suhu": 36.4
    }
  },
  {
    "id": 17,
    "no": "A-010",
    "jam": "08:10",
    "keterangan": "Selesai 08:20",
    "rm": "RM-200910",
    "jaminan": "BPJS Kesehatan",
    "nama": "Wati Susanti",
    "jk": "Perempuan",
    "umur": 44,
    "status": "selesai",
    "triage": null,
    "hasil": "Resep Terbit",
    "td": "128/84",
    "tindakLanjut": "Kontrol Rutin"
  },
  {
    "id": 18,
    "no": "A-009",
    "jam": "08:09",
    "keterangan": "Selesai 08:20",
    "rm": "RM-200819",
    "jaminan": "BPJS Kesehatan",
    "nama": "Hari Mulyono",
    "jk": "Laki-laki",
    "umur": 67,
    "status": "selesai",
    "triage": null,
    "hasil": "Resep Terbit",
    "td": "128/84",
    "tindakLanjut": "Kontrol Rutin"
  }
];
