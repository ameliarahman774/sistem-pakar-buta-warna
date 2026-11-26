// Database Supabase (Postgres di cloud) — Sistem Pakar Buta Warna.
// Menggantikan SQLite lokal — migrasi penuh ke Supabase 2026-11-25.
// Tabel: jenis_buta_warna, gejala, plat_ishihara, aturan,
// riwayat_konsultasi, detail_jawaban (lihat supabase/schema.sql).
//
// API di file ini SENGAJA dipertahankan sama seperti versi SQLite dulu,
// supaya layar-layar (Admin, History, Consult, Result, Home, App) tidak
// perlu diubah: initDatabase, bacaJenis/Gejala/Plat/Aturan,
// muatAturanUntukInferensi, muatGejalaUntukInferensi, tambah/ubah/hapus
// tiap tabel master, simpan/baca/hapus riwayat, statistikRiwayat.
//
// Perilaku kalau Supabase belum dikonfigurasi (belum ada .env):
// - initDatabase() tetap resolve (aplikasi tetap terbuka), tapi tidak
//   melempar error — konsultasi memakai bundled knowledge base.
// - baca*/muat* mengembalikan bundled KB sebagai fallback.
// - tambah/ubah/hapus/simpan riwayat melempar error yang menjelaskan
//   cara setup Supabase (ditangkap layar sebagai Alert).
// Perilaku kalau Supabase sudah dikonfigurasi tapi sedang offline /
// tabel belum dibuat: baca*/muat* fallback ke bundled KB, initDatabase
// resolve tanpa melempar, dan simpanRiwayat melempar error jaringan.

import { supabase, isSupabaseConfigured, butuhSupabase } from './supabaseClient';
import { GEJALA, JENIS_BUTA_WARNA, ATURAN } from '../data/knowledgeBase';
import { ISHIHARA_PLATES } from '../data/ishiharaPlates';

// Kompatibilitas: dulu getDb() mengembalikan koneksi SQLite.
// Sekarang mengembalikan klien Supabase (atau null kalau belum dikonfigurasi).
export function getDb() {
  return supabase;
}

function lemparKalauGagal(res, aksi) {
  if (res.error) throw new Error(`${aksi} gagal: ${res.error.message}`);
  return res.data;
}

function normalisasiAturan(rows) {
  return (rows || []).map((r) => ({
    ...r,
    // Supabase menyimpan premis sebagai text[]; kalau datang sebagai
    // string (misal data lama), coba parse.
    premis: Array.isArray(r.premis) ? r.premis : JSON.parse(r.premis || '[]'),
  }));
}

function parseArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try { const parsed = JSON.parse(v); return Array.isArray(parsed) ? parsed : [v]; } catch { return v ? [v] : []; }
  }
  return [];
}

function normalisasiJenis(rows) {
  return (rows || []).map((j) => ({
    ...j,
    labelParsial: j.labelParsial ?? j.label_parsial ?? '',
  }));
}

function normalisasiPlat(rows) {
  return (rows || []).map((p) => {
    const kategori = p.kategori || 'merah-hijau';
    const warnaAngkaDefault = kategori === 'biru-kuning' ? '#1565c0' : kategori === 'hijau' ? '#2e7d32' : kategori === 'total' ? '#424242' : '#c62828';
    const warnaLatarDefault = kategori === 'biru-kuning' ? '#f9a825' : kategori === 'hijau' ? '#8d6e63' : kategori === 'total' ? '#bdbdbd' : '#2e7d32';
    return {
      ...p,
      angkaBenar: p.angkaBenar ?? p.angka_benar ?? '',
      angkaSalahUmum: parseArray(p.angkaSalahUmum ?? p.angka_salah_umum),
      warnaTarget: p.warnaTarget ?? p.warna_target ?? '',
      warnaLatar: p.warnaLatar ?? p.warna_latar ?? '',
      pasanganWarnaTertukar: p.pasanganWarnaTertukar ?? p.pasangan_warna_tertukar ?? '',
      warnaAngka: p.warnaAngka ?? p.warna_angka ?? warnaAngkaDefault,
      warnaTitikLatar: p.warnaTitikLatar ?? p.warna_titik_latar ?? warnaLatarDefault,
    };
  });
}

export async function initDatabase() {
  if (!isSupabaseConfigured()) {
    // Jangan crash — aplikasi jalan dengan bundled KB (mode demo/offline).
    console.warn(
      '[database] Supabase belum dikonfigurasi (isi .env). ' +
        'Memakai bundled knowledge base. Lihat README > Setup Supabase.',
    );
    return { configured: false, seeded: false };
  }
  try {
    await seedJikaKosong();
    return { configured: true, seeded: true };
  } catch (e) {
    // Tabel belum dibuat / offline / RLS belum diatur: jangan blokir aplikasi.
    const pesan = String(e.message || e);
    if (pesan.includes('row-level security')) {
      console.warn(
        '[database] RLS Supabase menolak akses dari aplikasi. ' +
          'Jalankan supabase/perbaiki-rls.sql di Supabase Dashboard > SQL Editor, ' +
          'lalu restart aplikasi. Sementara ini memakai bundled KB.',
      );
    } else {
      console.warn('[database] initDatabase gagal (fallback ke bundled KB):', pesan);
    }
    return { configured: true, seeded: false, error: pesan };
  }
}

async function seedJikaKosong() {
  const cek = await supabase.from('gejala').select('id', { count: 'exact', head: true });
  if (cek.error) throw new Error(cek.error.message);
  if (cek.count > 0) return;
  // Seed sekali saja, dari bundled KB. Upsert supaya aman diulang.
  const { error: e1 } = await supabase.from('jenis_buta_warna').upsert(
    JENIS_BUTA_WARNA.map((j) => ({
      id: j.id,
      nama: j.nama,
      label_parsial: j.labelParsial || '',
      kelompok: j.kelompok || '',
      deskripsi: j.deskripsi || '',
      saran: j.saran || '',
    })),
  );
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await supabase.from('gejala').upsert(
    GEJALA.map((g) => ({ id: g.id, teks: g.teks, bobot: g.bobot, kelompok: g.kelompok })),
  );
  if (e2) throw new Error(e2.message);
  const { error: e3 } = await supabase.from('plat_ishihara').upsert(
    ISHIHARA_PLATES.map((p) => ({
      id: p.id,
      nomor: p.nomor,
      angka_benar: p.angkaBenar,
      angka_salah_umum: p.angkaSalahUmum || [],
      kategori: p.kategori,
      warna_target: p.warnaTarget,
      warna_latar: p.warnaLatar,
      pasangan_warna_tertukar: p.pasanganWarnaTertukar,
      arti: p.arti || '',
      warna_angka: p.warnaAngka || null,
      warna_titik_latar: p.warnaTitikLatar || null,
    })),
  );
  if (e3) throw new Error(e3.message);
  const { error: e4 } = await supabase.from('aturan').upsert(
    ATURAN.map((r) => ({
      id: r.id,
      premis: r.premis,
      konklusi: r.konklusi,
      cf: r.cf,
      penjelasan: r.penjelasan || '',
    })),
  );
  if (e4) throw new Error(e4.message);
}

// ---------- Baca master data ----------
export async function bacaJenis() {
  if (!isSupabaseConfigured()) return JENIS_BUTA_WARNA;
  const res = await supabase.from('jenis_buta_warna').select('*').order('id');
  if (res.error) return JENIS_BUTA_WARNA;
  return normalisasiJenis(res.data);
}
// Migrasi teks G24 lama (menanyakan hasil tes sebelum tes) ke teks gejala keseharian.
function migrasiTeksGejala(rows) {
  return rows.map((r) => (r.id === 'G24' && String(r.teks || '').startsWith('Tidak bisa melihat angka')
    ? { ...r, teks: 'Sering dikoreksi orang lain saat menyebut warna' }
    : r));
}
export async function bacaGejala() {
  if (!isSupabaseConfigured()) return GEJALA;
  const res = await supabase.from('gejala').select('*').order('id');
  if (res.error) return GEJALA;
  return migrasiTeksGejala(res.data);
}
export async function bacaPlat() {
  if (!isSupabaseConfigured()) return ISHIHARA_PLATES;
  const res = await supabase.from('plat_ishihara').select('*').order('nomor');
  if (res.error) return ISHIHARA_PLATES;
  return normalisasiPlat(res.data);
}
export async function bacaAturan() {
  if (!isSupabaseConfigured()) return ATURAN;
  const res = await supabase.from('aturan').select('*').order('id');
  if (res.error) return ATURAN;
  return normalisasiAturan(res.data);
}
// Aturan dari Supabase untuk mesin inferensi (fallback ke bundled bila kosong/error).
export async function muatAturanUntukInferensi() {
  try {
    const rows = await bacaAturan();
    if (rows.length >= 10) return rows;
  } catch (e) { /* fallback di bawah */ }
  return ATURAN;
}
export async function muatGejalaUntukInferensi() {
  try {
    const rows = await bacaGejala();
    if (rows.length >= 10) return rows.map((r) => ({ id: r.id, teks: r.teks, bobot: r.bobot, kelompok: r.kelompok }));
  } catch (e) { /* fallback */ }
  return GEJALA;
}
export async function muatJenisUntukInferensi() {
  try {
    const rows = await bacaJenis();
    if (rows.length > 0) return rows;
  } catch (e) { /* fallback */ }
  return JENIS_BUTA_WARNA;
}
export async function muatPlatUntukInferensi() {
  try {
    const rows = await bacaPlat();
    if (rows.length >= 10) return rows;
  } catch (e) { /* fallback */ }
  return ISHIHARA_PLATES;
}

// ---------- CRUD generik master data ----------
export async function tambahJenis(j) {
  const db = butuhSupabase();
  lemparKalauGagal(
    await db.from('jenis_buta_warna').insert({ id: j.id, nama: j.nama, label_parsial: j.labelParsial || '', kelompok: j.kelompok || '', deskripsi: j.deskripsi || '', saran: j.saran || '' }),
    'Tambah jenis',
  );
}
export async function ubahJenis(id, j) {
  const db = butuhSupabase();
  lemparKalauGagal(
    await db.from('jenis_buta_warna').update({ nama: j.nama, label_parsial: j.labelParsial || '', kelompok: j.kelompok || '', deskripsi: j.deskripsi || '', saran: j.saran || '' }).eq('id', id),
    'Ubah jenis',
  );
}
export async function hapusJenis(id) {
  const db = butuhSupabase();
  lemparKalauGagal(await db.from('jenis_buta_warna').delete().eq('id', id), 'Hapus jenis');
}

export async function tambahGejala(g) {
  const db = butuhSupabase();
  lemparKalauGagal(
    await db.from('gejala').insert({ id: g.id, teks: g.teks, bobot: g.bobot || 0.7, kelompok: g.kelompok || 'umum' }),
    'Tambah gejala',
  );
}
export async function ubahGejala(id, g) {
  const db = butuhSupabase();
  lemparKalauGagal(
    await db.from('gejala').update({ teks: g.teks, bobot: g.bobot || 0.7, kelompok: g.kelompok || 'umum' }).eq('id', id),
    'Ubah gejala',
  );
}
export async function hapusGejala(id) {
  const db = butuhSupabase();
  lemparKalauGagal(await db.from('gejala').delete().eq('id', id), 'Hapus gejala');
}

export async function tambahPlat(p) {
  const db = butuhSupabase();
  lemparKalauGagal(
    await db.from('plat_ishihara').insert({
      id: p.id,
      nomor: p.nomor,
      angka_benar: p.angkaBenar,
      angka_salah_umum: p.angkaSalahUmum || [],
      kategori: p.kategori,
      warna_target: p.warnaTarget,
      warna_latar: p.warnaLatar,
      pasangan_warna_tertukar: p.pasanganWarnaTertukar,
      arti: p.arti || '',
      warna_angka: p.warnaAngka || null,
      warna_titik_latar: p.warnaTitikLatar || null,
    }),
    'Tambah plat',
  );
}
export async function ubahPlat(id, p) {
  const db = butuhSupabase();
  lemparKalauGagal(
    await db.from('plat_ishihara').update({
      nomor: p.nomor,
      angka_benar: p.angkaBenar,
      angka_salah_umum: p.angkaSalahUmum || [],
      kategori: p.kategori,
      warna_target: p.warnaTarget,
      warna_latar: p.warnaLatar,
      pasangan_warna_tertukar: p.pasanganWarnaTertukar,
      arti: p.arti || '',
      warna_angka: p.warnaAngka || null,
      warna_titik_latar: p.warnaTitikLatar || null,
    }).eq('id', id),
    'Ubah plat',
  );
}
export async function hapusPlat(id) {
  const db = butuhSupabase();
  lemparKalauGagal(await db.from('plat_ishihara').delete().eq('id', id), 'Hapus plat');
}

export async function tambahAturan(r) {
  const db = butuhSupabase();
  lemparKalauGagal(
    await db.from('aturan').insert({ id: r.id, premis: r.premis, konklusi: r.konklusi, cf: r.cf, penjelasan: r.penjelasan || '' }),
    'Tambah aturan',
  );
}
export async function ubahAturan(id, r) {
  const db = butuhSupabase();
  lemparKalauGagal(
    await db.from('aturan').update({ premis: r.premis, konklusi: r.konklusi, cf: r.cf, penjelasan: r.penjelasan || '' }).eq('id', id),
    'Ubah aturan',
  );
}
export async function hapusAturan(id) {
  const db = butuhSupabase();
  lemparKalauGagal(await db.from('aturan').delete().eq('id', id), 'Hapus aturan');
}

// ---------- Riwayat konsultasi ----------
export async function simpanRiwayat({ nama, umur, tanggal, hasil, gejalaTerpilih, jawabanPlat }) {
  const db = butuhSupabase();
  const res = await db.from('riwayat_konsultasi').insert({
    nama: nama || 'Tanpa nama',
    umur: umur || '',
    tanggal: tanggal || new Date().toISOString(),
    diagnosis: hasil.diagnosis,
    diagnosis_nama: hasil.diagnosisNama,
    cf: hasil.cf,
    hasil_json: hasil,
  }).select('id').single();
  lemparKalauGagal(res, 'Simpan riwayat');
  const riwayatId = res.data.id;
  const detail = [];
  for (const g of gejalaTerpilih || []) detail.push({ riwayat_id: riwayatId, jenis: 'gejala', kode: g, jawaban: 'ya' });
  for (const [kode, jawaban] of Object.entries(jawabanPlat || {})) detail.push({ riwayat_id: riwayatId, jenis: 'plat', kode, jawaban: String(jawaban) });
  if (detail.length > 0) {
    lemparKalauGagal(await db.from('detail_jawaban').insert(detail), 'Simpan detail jawaban');
  }
  return riwayatId;
}
export async function bacaRiwayat(cari = '') {
  if (!isSupabaseConfigured()) return [];
  let q = supabase.from('riwayat_konsultasi').select('*').order('id', { ascending: false });
  if (cari) {
    const aman = cari.replace(/[%_,]/g, '');
    q = q.or(`nama.ilike.%${aman}%,diagnosis_nama.ilike.%${aman}%`);
  }
  const res = await q;
  if (res.error) return [];
  return res.data;
}
export async function bacaRiwayatDetail(id) {
  if (!isSupabaseConfigured()) return null;
  const res = await supabase.from('riwayat_konsultasi').select('*').eq('id', id).single();
  if (res.error || !res.data) return null;
  const item = res.data;
  const d = await supabase.from('detail_jawaban').select('*').eq('riwayat_id', id);
  return { ...item, hasil: item.hasil_json, detail: d.data || [] };
}
export async function hapusRiwayat(id) {
  const db = butuhSupabase();
  // detail_jawaban ikut terhapus via ON DELETE CASCADE, tapi hapus eksplisit
  // juga aman kalau constraint belum ada.
  await db.from('detail_jawaban').delete().eq('riwayat_id', id);
  lemparKalauGagal(await db.from('riwayat_konsultasi').delete().eq('id', id), 'Hapus riwayat');
}
export async function statistikRiwayat() {
  if (!isSupabaseConfigured()) return { total: 0, perDiagnosis: [] };
  const res = await supabase.from('riwayat_konsultasi').select('diagnosis_nama');
  if (res.error) return { total: 0, perDiagnosis: [] };
  const hitung = {};
  for (const r of res.data || []) hitung[r.diagnosis_nama] = (hitung[r.diagnosis_nama] || 0) + 1;
  const perDiagnosis = Object.entries(hitung)
    .map(([diagnosis_nama, c]) => ({ diagnosis_nama, c }))
    .sort((a, b) => b.c - a.c);
  return { total: (res.data || []).length, perDiagnosis };
}
