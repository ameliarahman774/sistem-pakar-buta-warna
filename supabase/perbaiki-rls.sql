-- Perbaikan RLS: jalankan file ini di Supabase Dashboard > SQL Editor
-- kalau aplikasi menampilkan error:
--   "new row violates row-level security policy for table ..."
--
-- File ini aman dijalankan berulang kali (idempotent).
-- Untuk tugas/demo: policy terbuka untuk peran anon (baca + tulis).
-- Untuk produksi, ganti policy ini dengan policy yang lebih ketat.

alter table jenis_buta_warna enable row level security;
alter table gejala enable row level security;
alter table plat_ishihara enable row level security;
alter table aturan enable row level security;
alter table riwayat_konsultasi enable row level security;
alter table detail_jawaban enable row level security;

drop policy if exists "anon_all" on jenis_buta_warna;
create policy "anon_all" on jenis_buta_warna for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon_all" on gejala;
create policy "anon_all" on gejala for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon_all" on plat_ishihara;
create policy "anon_all" on plat_ishihara for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon_all" on aturan;
create policy "anon_all" on aturan for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon_all" on riwayat_konsultasi;
create policy "anon_all" on riwayat_konsultasi for all to anon, authenticated using (true) with check (true);

drop policy if exists "anon_all" on detail_jawaban;
create policy "anon_all" on detail_jawaban for all to anon, authenticated using (true) with check (true);

grant select, insert, update, delete on jenis_buta_warna, gejala, plat_ishihara, aturan, riwayat_konsultasi, detail_jawaban to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
