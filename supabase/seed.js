// Seed Supabase lewat Node — alternatif dari menjalankan schema.sql.
// Cara pakai:
//   1. Buat project di supabase.com, jalankan DDL di supabase/schema.sql
//      (bagian CREATE TABLE + RLS) di SQL Editor — atau jalankan file ini
//      setelah tabel dibuat.
//   2. Isi .env dengan EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.
//   3. Jalankan:  node supabase/seed.js
// Script ini membaca bundled knowledge base (src/data/) dan meng-upsert
// 8 jenis, 24 gejala, 24 plat, dan 58 aturan ke Supabase. Aman diulang.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { GEJALA, JENIS_BUTA_WARNA, ATURAN } from '../src/data/knowledgeBase.js';
import { ISHIHARA_PLATES } from '../src/data/ishiharaPlates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Baca .env manual (tanpa dependensi dotenv) supaya script tetap ringan.
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
  console.error('GAGAL: isi dulu EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY di .env (lihat .env.example).');
  process.exit(1);
}

const supabase = createClient(url, key);

async function upsert(tabel, rows) {
  const { error } = await supabase.from(tabel).upsert(rows);
  if (error) throw new Error(`${tabel}: ${error.message}`);
  console.log(`OK ${tabel}: ${rows.length} baris`);
}

await upsert('jenis_buta_warna', JENIS_BUTA_WARNA.map((j) => ({ id: j.id, nama: j.nama, label_parsial: j.labelParsial || '', kelompok: j.kelompok || '', deskripsi: j.deskripsi || '', saran: j.saran || '' })));
await upsert('gejala', GEJALA.map((g) => ({ id: g.id, teks: g.teks, bobot: g.bobot, kelompok: g.kelompok })));
await upsert('plat_ishihara', ISHIHARA_PLATES.map((p) => ({ id: p.id, nomor: p.nomor, angka_benar: p.angkaBenar, angka_salah_umum: p.angkaSalahUmum || [], kategori: p.kategori, warna_target: p.warnaTarget, warna_latar: p.warnaLatar, pasangan_warna_tertukar: p.pasanganWarnaTertukar, arti: p.arti || '', warna_angka: p.warnaAngka || null, warna_titik_latar: p.warnaTitikLatar || null })));
await upsert('aturan', ATURAN.map((r) => ({ id: r.id, premis: r.premis, konklusi: r.konklusi, cf: r.cf, penjelasan: r.penjelasan || '' })));
console.log('SEED SELESAI.');
