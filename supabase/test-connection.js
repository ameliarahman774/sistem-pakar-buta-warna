// Tes koneksi Supabase — tanpa harus buka aplikasi.
// Cara pakai:
//   1. Jalankan dulu: npm install
//   2. Isi .env (cp .env.example .env, isi URL + anon key dari Supabase).
//   3. Jalankan:  node supabase/test-connection.js
// Script ini HANYA membaca (tidak menulis apa-apa): menghitung baris di
// tiap tabel dan membandingkannya dengan yang seharusnya terisi dari seed.
// Kalau ada yang GAGAL, pesannya bilang kemungkinan penyebabnya.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Baca .env manual (tanpa dependensi dotenv), sama seperti seed.js.
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('GAGAL: .env belum diisi.');
  console.error('  1. cp .env.example .env');
  console.error('  2. Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.error('     dari Supabase Dashboard > Settings > API (pakai anon key, bukan service_role).');
  console.error('  3. Jalankan lagi: node supabase/test-connection.js');
  process.exit(1);
}

// Import supabase-js baru dilakukan di sini, sesudah cek .env — supaya
// kalau node_modules belum ter-install, pesannya jelas, bukan crash.
let createClient;
try {
  ({ createClient } = await import('@supabase/supabase-js'));
} catch {
  console.error('GAGAL: paket @supabase/supabase-js belum ter-install.');
  console.error('  Jalankan dulu: npm install');
  console.error('  Lalu jalankan lagi: node supabase/test-connection.js');
  process.exit(1);
}

const supabase = createClient(url, key);

// Tabel + jumlah baris yang diharapkan setelah schema.sql di-run.
const CHECKS = [
  { tabel: 'jenis_buta_warna', harap: 8 },
  { tabel: 'gejala', harap: 24 },
  { tabel: 'plat_ishihara', harap: 24 },
  { tabel: 'aturan', harap: 58 },
  { tabel: 'riwayat_konsultasi', harap: 0, minSaja: true },
  { tabel: 'detail_jawaban', harap: 0, minSaja: true },
];

let gagal = 0;
for (const { tabel, harap, minSaja } of CHECKS) {
  let res;
  try {
    res = await supabase.from(tabel).select('*', { count: 'exact', head: true });
  } catch (e) {
    gagal += 1;
    console.error(`GAGAL ${tabel}: tidak bisa terhubung (${e.message}).`);
    console.error(`  Kemungkinan: URL di .env salah, atau tidak ada internet.`);
    continue;
  }
  const { count, error } = res;
  if (error) {
    gagal += 1;
    // Supabase kadang mengembalikan { message: "" } saat host tidak menjawab.
    if (!error.message && !error.code) {
      console.error(`GAGAL ${tabel}: tidak bisa terhubung ke Supabase (host tidak menjawab).`);
      console.error(`  Kemungkinan: URL di .env salah / project belum dibuat, atau tidak ada internet.`);
      console.error(`  Cek EXPO_PUBLIC_SUPABASE_URL di .env dengan URL project di Supabase Dashboard.`);
      continue;
    }
    const pesan = error.message || error.code || JSON.stringify(error);
    console.error(`GAGAL ${tabel}: ${pesan}`);
    if (/fetch failed|Failed to fetch|network|ENOTFOUND|EAI_AGAIN/i.test(pesan)) {
      console.error(`  Kemungkinan: URL di .env salah, atau tidak ada internet / host tidak bisa dijangkau.`);
    } else {
      console.error(`  Kemungkinan: tabel belum dibuat (jalankan supabase/schema.sql di SQL Editor)`);
      console.error(`  atau RLS memblokir anon key. Cek Supabase Dashboard > Table Editor.`);
    }
    continue;
  }
  const lolos = minSaja ? count >= harap : count === harap;
  if (lolos) {
    console.log(`OK ${tabel}: ${count} baris${minSaja ? ' (boleh 0 kalau belum ada konsultasi)' : ` (sesuai, harap ${harap})`}`);
  } else {
    gagal += 1;
    console.error(`GAGAL ${tabel}: dapat ${count} baris, harap ${harap}.`);
    console.error(`  Kemungkinan: seed belum jalan. Jalankan supabase/schema.sql lagi atau node supabase/seed.js`);
  }
}

if (gagal === 0) {
  console.log('\nKONEKSI SUPABASE OK — semua tabel bisa dibaca dan isinya sesuai seed.');
  console.log('Lanjut: npx expo start, lalu coba satu konsultasi dan simpan ke Riwayat.');
} else {
  console.error(`\n${gagal} tabel bermasalah. Perbaiki dulu, lalu jalankan lagi script ini.`);
  process.exit(1);
}
