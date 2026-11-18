function bilanganNonNegatif(nilai) {
  if (nilai === null || nilai === undefined || nilai === '') return null;
  const angka = Number(nilai);
  return Number.isSafeInteger(angka) && angka >= 0 ? angka : null;
}

export function evaluasiStokObat(item) {
  const stokTercatat = bilanganNonNegatif(item?.jumlah_stok);
  const jumlahResep = bilanganNonNegatif(item?.jumlah_obat);

  if (stokTercatat === 0) {
    return {
      status: 'tidak_mencukupi',
      label: 'Stok tidak mencukupi',
      tone: 'danger',
      stokTercatat,
      jumlahResep,
      ringkasan: jumlahResep === null
        ? 'Tidak ada stok tercatat.'
        : `0 dari ${jumlahResep} unit resep tercatat.`,
    };
  }

  if (stokTercatat === null || jumlahResep === null || jumlahResep === 0) {
    return {
      status: 'tidak_diketahui',
      label: 'Status stok tidak diketahui',
      tone: 'neutral',
      stokTercatat,
      jumlahResep,
      ringkasan: 'Data stok atau jumlah resep belum tersedia.',
    };
  }

  if (stokTercatat < jumlahResep) {
    return {
      status: 'terbatas',
      label: 'Stok terbatas',
      tone: 'warning',
      stokTercatat,
      jumlahResep,
      ringkasan: `${stokTercatat} dari ${jumlahResep} unit resep tercatat.`,
    };
  }

  return {
    status: 'tersedia',
    label: 'Tersedia',
    tone: 'success',
    stokTercatat,
    jumlahResep,
    ringkasan: `${stokTercatat} unit tercatat untuk kebutuhan ${jumlahResep} unit.`,
  };
}
