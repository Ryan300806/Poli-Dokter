function bilanganNonNegatif(nilai) {
  if (nilai === null || nilai === undefined || nilai === '') return null;
  const angka = Number(nilai);
  return Number.isSafeInteger(angka) && angka >= 0 ? angka : null;
}

export function evaluasiStokObat(item) {
  const stokTercatat = bilanganNonNegatif(item?.jumlah_stok);
  const jumlahResep = bilanganNonNegatif(item?.jumlah_obat);

  if (stokTercatat === null) {
    return {
      status: 'tidak_diketahui',
      label: 'Status stok tidak diketahui',
      tone: 'neutral',
      stokTercatat,
      jumlahResep,
      ringkasan: 'Data stok belum tersedia.',
    };
  }

  if (stokTercatat === 0) {
    return {
      status: 'tidak_tersedia',
      label: 'Tidak Tersedia',
      tone: 'danger',
      stokTercatat,
      jumlahResep,
      ringkasan: 'Tidak ada stok tercatat.',
    };
  }

  if (jumlahResep === null || jumlahResep === 0) {
    return {
      status: 'tidak_diketahui',
      label: 'Status stok tidak diketahui',
      tone: 'neutral',
      stokTercatat,
      jumlahResep,
      ringkasan: 'Jumlah kebutuhan resep belum tersedia.',
    };
  }

  if (stokTercatat < jumlahResep) {
    return {
      status: 'tidak_mencukupi',
      label: 'Tidak Mencukupi',
      tone: 'warning',
      stokTercatat,
      jumlahResep,
      ringkasan: `${stokTercatat} dari ${jumlahResep} unit kebutuhan resep.`,
    };
  }

  return {
    status: 'tersedia',
    label: 'Tersedia',
    tone: 'success',
    stokTercatat,
    jumlahResep,
    ringkasan: `${stokTercatat} unit tersedia untuk kebutuhan ${jumlahResep} unit.`,
  };
}
