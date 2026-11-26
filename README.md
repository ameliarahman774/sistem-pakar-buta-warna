# Sistem Informasi Pakar Buta Warna — React Native (Expo)

Aplikasi mobile untuk menganalisa apakah seseorang buta warna, jenisnya apa,
dan **kenapa** hasilnya begitu — dengan data dan bukti, bukan sekadar tebakan.

> ⚠️ **Skrining awal, bukan diagnosis medis.** Plat di aplikasi ini adalah
> **simulasi prosedural** (angka dari pola titik berwarna di layar), bukan
> plat Ishihara klinis asli. Hasil perlu dikonfirmasi dokter mata
> (tes lanjutan: anomaloskop, Farnsworth D-15).

## Yang ada di aplikasi ini

- **48 premis (> 45)** — 24 gejala (G01–G24) + 24 plat Ishihara (P01–P24).
- **58 aturan forward chaining (R01–R58)** — tiap aturan punya premis,
  konklusi, CF pakar (0–1), dan penjelasan.
- **Forward chaining + Certainty Factor** — mesin inferensi di
  `src/engine/forwardChaining.js` (murni JS, bisa dites dengan Node).
- **Penjelasan hasil** — "Kenapa hasil ini?": tabel bukti per plat (jawaban kamu vs jawaban benar,
  warna target vs latar, warna yang tertukar), dan warna yang benar seharusnya.
  Contoh: hasil *Buta Warna Parsial Hijau (Deuteranomaly)* dijelaskan karena
  gagal membedakan **hijau vs merah** pada plat tertentu, padahal angka yang
  benar seharusnya dibentuk titik hijau di atas latar merah.
- **Database + CRUD — Supabase (Postgres di cloud):**
  tabel `jenis_buta_warna`, `gejala`, `plat_ishihara`, `aturan`,
  `riwayat_konsultasi`, `detail_jawaban`. Konsultasi memuat data master
  (jenis, gejala, plat, aturan) dari Supabase. Riwayat
  tersimpan di cloud, jadi tidak hilang kalau aplikasi dihapus / ganti HP.
  (Sebelumnya memakai SQLite lokal — sudah diganti penuh ke Supabase.)
- **Riwayat & dokumen** — tiap hasil bisa disimpan, dibuka lagi lengkap
  dengan bukti per plat, dihapus, dan dicari. Hasil juga bisa diunduh
  sebagai **PDF rapi** berisi nama, umur, serta tanggal & waktu tes.

## Jenis hasil yang dikenali

Normal, Protanopia, Protanomaly, Deuteranopia, Deuteranomaly,
Tritanopia, Tritanomaly, Achromatopsia — plus label
*Buta Warna Parsial Merah / Hijau / Biru-Kuning* dan *Buta Warna Total*.

## Setup Supabase (wajib dibaca dulu)

Tanpa langkah ini aplikasi tetap bisa dibuka, tapi konsultasi memakai
bundled knowledge base dan **riwayat / CRUD tidak tersimpan** (mode fallback).

### (a) Buat project di Supabase

1. Buka https://supabase.com, login / daftar, klik **New project**.
2. Isi nama project (misal `sistem-pakar-buta-warna`), pilih region
   terdekat (misal Singapore), buat password database, tunggu sampai
   project selesai dibuat (1–2 menit).

### (b) Buat tabel — jalankan `supabase/schema.sql`

1. Di dashboard Supabase, buka **SQL Editor** > **New query**.
2. Buka file `supabase/schema.sql` di repo ini, salin seluruh isinya,
   tempel ke SQL Editor, klik **Run**.
3. File itu membuat 6 tabel (`jenis_buta_warna`, `gejala`,
   `plat_ishihara`, `aturan`, `riwayat_konsultasi`, `detail_jawaban`),
   mengaktifkan RLS + policy anon, dan langsung me-seed
   8 jenis, 24 gejala, 24 plat, dan 58 aturan. Aman diulang (upsert).

### (c) Seed (kalau kamu hanya menjalankan bagian CREATE TABLE saja)

Kalau kamu tidak menjalankan seluruh `schema.sql`, seed bisa lewat Node:

```bash
node supabase/seed.js
```

(Syarat: `.env` sudah terisi seperti langkah (d). Script ini membaca
`src/data/knowledgeBase.js` dan `src/data/ishiharaPlates.js`, lalu
meng-upsert data yang sama ke Supabase.)

### (d) Isi `.env` dengan URL + anon key

1. Di dashboard Supabase, buka **Settings > API**.
2. Salin **Project URL** dan **anon public key**.
3. Di folder repo:

```bash
cp .env.example .env
```

Lalu isi di `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> ⚠️ Pakai **anon key**, BUKAN **service_role key**. Service_role key
> punya akses penuh dan **jangan pernah** dimasukkan ke aplikasi mobile
> atau di-push ke GitHub. File `.env` sudah diabaikan `.gitignore`
> dan **tidak ikut di-push** — yang di-push hanya kode + `.env.example`.

### (e) Jalankan aplikasi

```bash
npm install
npx expo start
```

Lalu buka **Expo Go** di HP (Android / iOS), scan QR yang muncul di terminal.
Pastikan HP dan laptop di Wi-Fi yang sama. Untuk web:

```bash
npx expo start --web
```

> **Perbaikan 2026-11-25:** `package.json` sudah berisi `expo-asset` dan
> `expo-constants` (wajib untuk SDK 58) serta `react-dom`,
> `react-native-web`, dan `@expo/metro-runtime` (untuk versi web).
> Kalau kamu masih pakai salinan lama, jalankan:
> `npx expo install expo-asset expo-constants react-dom react-native-web @expo/metro-runtime`
> lalu `npm install` dan `npx expo start -c`.

### (f) Cara tes

Tes mesin inferensi tanpa HP / tanpa Supabase (Node saja):

```bash
node scripts/test-engine.js
```

Harus keluar `SEMUA TES LOLOS.` — 3 persona (Normal, Protan total,
Deutan total) + 1 persona Deutan parsial.

Tes dengan Supabase: setelah langkah (a)–(e), lakukan satu konsultasi di
aplikasi lalu tekan **Simpan ke Riwayat**, kemudian buka menu **Riwayat**
dan cek di Supabase Dashboard > **Table Editor > riwayat_konsultasi**
— baris baru harus muncul di sana. Kalau tabel kosong / error, cek
`.env` sudah terisi dan `schema.sql` sudah di-Run.

Tes koneksi Supabase dari terminal (tanpa buka aplikasi, hanya membaca):

```bash
node supabase/test-connection.js
```

Harus keluar `KONEKSI SUPABASE OK` dengan hitungan 8 jenis, 24 gejala,
24 plat, 58 aturan. Kalau ada yang GAGAL, pesannya langsung bilang
kemungkinan penyebabnya (misal `.env` belum diisi, tabel belum dibuat,
atau URL-nya salah).

**Mode tanpa Supabase (fallback):** kalau `.env` belum diisi, aplikasi
tetap terbuka dan konsultasi tetap jalan memakai bundled knowledge base
(`src/data/`), tapi tombol Simpan akan menampilkan pesan setup
Supabase. Jadi untuk demo cepat di kelas tanpa internet, aplikasi tetap
bisa dipakai — hanya riwayatnya tidak tersimpan ke cloud.

## Struktur folder

```
App.js                          # navigasi state-based sederhana
app.json                        # konfigurasi Expo
babel.config.js
package.json
.env.example                    # contoh .env (URL + anon key Supabase)
supabase/
  schema.sql                    # CREATE TABLE + RLS + seed 8 jenis / 24 gejala / 24 plat / 58 aturan
  seed.js                       # seed lewat Node: node supabase/seed.js
src/
  data/
    knowledgeBase.js            # 24 gejala, 8 jenis, 58 aturan, JUMLAH_PREMIS
    ishiharaPlates.js           # 24 plat: angka benar, warna, pasangan tertukar
  engine/
    forwardChaining.js          # mesin forward chaining + CF (murni JS)
    explain.js                  # penjelasan per plat
    pdfHasil.js                 # HTML hasil untuk PDF (expo-print)
    pdfFile.js                  # unduh PDF: jsPDF di web, dialog cetak sistem di HP
  db/
    supabaseClient.js           # createClient dari .env + isSupabaseConfigured()
    database.js                 # API Supabase: seed, CRUD master, riwayat
  components/
    IshiharaPlate.js            # plat simulasi dari pola titik (View)
assets/
  character-welcome.png         # karakter di layar awal tahap 1
  character-start.webp          # animasi karakter: 132 frame dari animation.json digabung jadi WebP animasi
  star.png                      # bintang melayang di layar awal
src/screens/
    WelcomeScreen.js            # layar awal 2 tahap: "Apakah anda buta warna?" (ketuk untuk lanjut) -> "Ayo tes bersama!" + tombol Start, animasi pop-up + bintang melayang
    HomeScreen.js               # penjelasan jenis + statistik (menu "Pelajari dulu")
    ConsultScreen.js            # konsultasi awal adaptif (4 pertanyaan inti), tes 15 plat pilihan
    ResultScreen.js             # diagnosis, CF, kenapa, bukti per plat
    HistoryScreen.js            # daftar + detail riwayat
scripts/
  test-engine.js                # tes Node untuk engine
```

## Cara tambah premis / aturan

1. **Cara kode:** edit `src/data/knowledgeBase.js` (tambah ke `GEJALA` /
   `ATURAN`) dan `src/data/ishiharaPlates.js` (tambah plat), lalu jalankan
   `node scripts/test-engine.js` untuk memastikan jumlah premis tetap
   di atas 45 dan aturan minimal 50, kemudian jalankan ulang seed
   (`node supabase/seed.js`) supaya Supabase ikut ter-update.

## Cara push ke GitHub

```bash
git add .
git commit -m "Sistem pakar buta warna - React Native Expo + Supabase"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Ganti `USERNAME` dan `NAMA-REPO` dengan akun dan nama repo kamu.
Untuk perubahan berikutnya:

```bash
git add .
git commit -m "penjelasan perubahan"
git push
```

**Catatan database:** yang di-push hanya kode + `supabase/schema.sql` /
`supabase/seed.js` + `.env.example`. File `.env` (berisi URL + anon key)
**tidak ikut di-push** (sudah ada di `.gitignore`). Siapa pun yang clone
repo ini harus membuat project Supabase sendiri dan mengisi `.env`-nya
sendiri mengikuti panduan di atas — basis pengetahuannya sama karena
seed-nya ikut ter-push.

## Deploy web ke Cloudflare Pages (link .pages.dev)

Setelah repo ter-push ke GitHub, deploy versi web-nya ke Cloudflare Pages
supaya dapat link berakhiran `.pages.dev`:

1. Buka Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**
   → hubungkan repo GitHub ini.
2. Isi build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Di **Environment variables**, isi dari `.env` lokal kamu:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Save and Deploy**. Hasilnya bisa dibuka di
   `https://NAMA-PROJECT.pages.dev`.

File `.env` tetap tidak ikut ter-push; nilai environment variable diisi
langsung di dashboard Cloudflare.

## Hasil verifikasi (2026-11-25)

- `node scripts/test-engine.js` — **SEMUA TES LOLOS.**
  - Premis: 48 (> 45), Aturan: 58 (≥ 50)
  - Normal → `NORMAL`, CF 97%
  - Protan total → `PROTANOPIA`, CF 97%
  - Deutan total → `DEUTERANOPIA`, CF 97%
  - Deutan parsial → `DEUTERANOMALY`, CF 97%
- `package.json` valid JSON; tidak ada lagi `expo-sqlite` di `src/` maupun
  `package.json`.
- Expo SDK 58 (expo ~58.0.26, React Native 0.88.1, React 19.3.0), slug `sistem-pakar-buta-warna` — kompatibel dengan Expo Go versi terbaru.
- Metro Bundler (`expo start` dan `expo start --web`) jalan tanpa error
  `expo-asset`.
- Konsultasi memuat plat & jenis dari Supabase
  (dengan fallback bundled), jadi CRUD plat/jenis ikut dipakai pada
  konsultasi berikutnya.
- **Belum dites end-to-end ke project Supabase asli** (tidak ada project
  Supabase Lilin yang bisa diakses saat verifikasi) — langkah
  (a)–(f) di atas harus dijalankan Lilin dengan project-nya sendiri.
  Yang terverifikasi tanpa kredensial: engine, schema SQL (jumlah seed),
  `seed.js` menolak jalan kalau `.env` kosong, dan aplikasi tidak crash
  saat Supabase belum dikonfigurasi (fallback bundled KB).
- Aplikasi belum dijalankan di Expo Go pada perangkat nyata saat verifikasi
  ini — jalankan `npx expo start` dan scan QR di Expo Go untuk tes di HP.
