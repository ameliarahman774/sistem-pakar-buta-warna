-- Pengetatan RLS setelah situs publik (Cloudflare Pages).
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor (New query), lalu Run.
-- Aman dijalankan berulang kali (idempotent). Tidak menghapus tabel/data.
--
-- Kenapa perlu: policy lama "anon_all" mengizinkan siapa pun yang punya anon key
-- (key itu ada di bundle web publik) untuk membaca DAN mengubah semua tabel,
-- termasuk aturan dan plat Ishihara. Artinya basis pengetahuan bisa diubah
-- orang asing dan hasil diagnosis semua pengguna ikut berubah.
--
-- Setelah file ini dijalankan:
-- - Tabel basis pengetahuan (jenis_buta_warna, gejala, plat_ishihara, aturan):
--   anon hanya bisa MEMBACA. Aplikasi tetap jalan normal karena data awal
--   sudah ada di database (seed hanya berjalan kalau tabel masih kosong;
--   untuk database baru, isi data awal lewat SQL Editor/schema.sql dulu).
-- - Tabel riwayat (riwayat_konsultasi, detail_jawaban): anon bisa membaca,
--   menambah, dan menghapus (sesuai fitur Riwayat di aplikasi), tapi tidak
--   bisa mengubah baris yang sudah ada.
-- Catatan jujur: karena aplikasi tidak memakai login, riwayat tetap bisa
-- dibaca siapa pun yang punya anon key. Penutupan penuh butuh autentikasi,
-- itu di luar cakupan perbaikan ini.

alter table jenis_buta_warna enable row level security;
alter table gejala enable row level security;
alter table plat_ishihara enable row level security;
alter table aturan enable row level security;
alter table riwayat_konsultasi enable row level security;
alter table detail_jawaban enable row level security;

-- Cabut izin tulis luas dari policy lama
drop policy if exists "anon_all" on jenis_buta_warna;
drop policy if exists "anon_all" on gejala;
drop policy if exists "anon_all" on plat_ishihara;
drop policy if exists "anon_all" on aturan;
drop policy if exists "anon_all" on riwayat_konsultasi;
drop policy if exists "anon_all" on detail_jawaban;

revoke all on jenis_buta_warna, gejala, plat_ishihara, aturan, riwayat_konsultasi, detail_jawaban from anon, authenticated;

-- Basis pengetahuan: baca saja
drop policy if exists "anon_select" on jenis_buta_warna;
create policy "anon_select" on jenis_buta_warna for select to anon, authenticated using (true);
drop policy if exists "anon_select" on gejala;
create policy "anon_select" on gejala for select to anon, authenticated using (true);
drop policy if exists "anon_select" on plat_ishihara;
create policy "anon_select" on plat_ishihara for select to anon, authenticated using (true);
drop policy if exists "anon_select" on aturan;
create policy "anon_select" on aturan for select to anon, authenticated using (true);
grant select on jenis_buta_warna, gejala, plat_ishihara, aturan to anon, authenticated;

-- Riwayat: baca, tambah, hapus (tanpa ubah)
drop policy if exists "anon_select" on riwayat_konsultasi;
create policy "anon_select" on riwayat_konsultasi for select to anon, authenticated using (true);
drop policy if exists "anon_insert" on riwayat_konsultasi;
create policy "anon_insert" on riwayat_konsultasi for insert to anon, authenticated with check (true);
drop policy if exists "anon_delete" on riwayat_konsultasi;
create policy "anon_delete" on riwayat_konsultasi for delete to anon, authenticated using (true);
drop policy if exists "anon_select" on detail_jawaban;
create policy "anon_select" on detail_jawaban for select to anon, authenticated using (true);
drop policy if exists "anon_insert" on detail_jawaban;
create policy "anon_insert" on detail_jawaban for insert to anon, authenticated with check (true);
drop policy if exists "anon_delete" on detail_jawaban;
create policy "anon_delete" on detail_jawaban for delete to anon, authenticated using (true);
grant select, insert, delete on riwayat_konsultasi, detail_jawaban to anon, authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;
