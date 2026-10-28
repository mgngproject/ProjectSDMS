-- Remunerasi karyawan TAD (nominal rupiah, bulat, tidak negatif). Diisi dari form; tidak disalin dari tabel karyawan.

alter table public.karyawan_tad
  add column upah_per_bulan bigint check (upah_per_bulan >= 0),
  add column jamsostek bigint check (jamsostek >= 0),
  add column bpjs_kesehatan bigint check (bpjs_kesehatan >= 0),
  add column kak bigint check (kak >= 0),
  add column tunjangan_keterampilan bigint check (tunjangan_keterampilan >= 0),
  add column tunjangan_transportasi bigint check (tunjangan_transportasi >= 0),
  add column tarif_premi_gilir bigint check (tarif_premi_gilir >= 0),
  add column uang_makan_ramadhan bigint check (uang_makan_ramadhan >= 0),
  add column perlengkapan_sarana_kerja bigint check (perlengkapan_sarana_kerja >= 0),
  add column tunjangan_kesiagaan bigint check (tunjangan_kesiagaan >= 0),
  add column pemberian_pulsa bigint check (pemberian_pulsa >= 0),
  add column insentif_bantuan_transport bigint check (insentif_bantuan_transport >= 0);
