// Basis Pengetahuan — Sistem Pakar Buta Warna
// Premis = 24 gejala (G01-G24) + 24 plat Ishihara (P01-P24) = 48 premis.
// Aturan = R01-R58 (58 aturan forward chaining).
// File ini murni data (tanpa import react-native) supaya bisa dipakai
// engine Node maupun aplikasi Expo.

import { ISHIHARA_PLATES } from './ishiharaPlates.js';

export const GEJALA = [
  { id: 'G01', teks: 'Sulit membedakan warna merah dan hijau', bobot: 0.9, kelompok: 'merah-hijau' },
  { id: 'G02', teks: 'Warna merah terlihat gelap, seperti coklat atau hitam', bobot: 0.9, kelompok: 'merah' },
  { id: 'G03', teks: 'Warna hijau terlihat seperti coklat atau abu-abu', bobot: 0.9, kelompok: 'hijau' },
  { id: 'G04', teks: 'Sulit membedakan merah dengan coklat', bobot: 0.8, kelompok: 'merah' },
  { id: 'G05', teks: 'Sulit membedakan hijau dengan coklat', bobot: 0.8, kelompok: 'hijau' },
  { id: 'G06', teks: 'Sulit membedakan hijau dengan kuning', bobot: 0.8, kelompok: 'hijau' },
  { id: 'G07', teks: 'Sulit membedakan merah dengan oranye', bobot: 0.7, kelompok: 'merah' },
  { id: 'G08', teks: 'Sering salah menyebut warna merah', bobot: 0.8, kelompok: 'merah' },
  { id: 'G09', teks: 'Sering salah menyebut warna hijau', bobot: 0.8, kelompok: 'hijau' },
  { id: 'G10', teks: 'Sulit membedakan lampu lalu lintas merah dan hijau', bobot: 0.9, kelompok: 'merah-hijau' },
  { id: 'G11', teks: 'Sulit membedakan biru dengan hijau', bobot: 0.8, kelompok: 'biru-kuning' },
  { id: 'G12', teks: 'Sulit membedakan biru dengan ungu', bobot: 0.7, kelompok: 'biru-kuning' },
  { id: 'G13', teks: 'Sulit membedakan kuning dengan hijau muda', bobot: 0.8, kelompok: 'biru-kuning' },
  { id: 'G14', teks: 'Warna kuning terlihat putih atau pucat', bobot: 0.8, kelompok: 'biru-kuning' },
  { id: 'G15', teks: 'Warna biru terlihat seperti hijau', bobot: 0.9, kelompok: 'biru-kuning' },
  { id: 'G16', teks: 'Semua warna terlihat pudar atau kusam', bobot: 0.8, kelompok: 'total' },
  { id: 'G17', teks: 'Hanya melihat hitam, putih, dan abu-abu', bobot: 0.95, kelompok: 'total' },
  { id: 'G18', teks: 'Sulit membedakan warna gelap dan terang', bobot: 0.7, kelompok: 'total' },
  { id: 'G19', teks: 'Mata cepat lelah saat membedakan warna', bobot: 0.6, kelompok: 'umum' },
  { id: 'G20', teks: 'Kesulitan pada pekerjaan yang butuh ketelitian warna (desain, kabel, dll)', bobot: 0.7, kelompok: 'umum' },
  { id: 'G21', teks: 'Ada riwayat keluarga buta warna (ayah/ibu/saudara)', bobot: 0.6, kelompok: 'umum' },
  { id: 'G22', teks: 'Sulit membedakan merah muda dengan abu-abu', bobot: 0.7, kelompok: 'merah' },
  { id: 'G23', teks: 'Sulit membedakan oranye dengan hijau', bobot: 0.7, kelompok: 'hijau' },
  { id: 'G24', teks: 'Sering dikoreksi orang lain saat menyebut warna', bobot: 0.8, kelompok: 'umum' },
];

export const JENIS_BUTA_WARNA = [
  { id: 'NORMAL', nama: 'Penglihatan Warna Normal', labelParsial: 'Normal', kelompok: 'Normal', deskripsi: 'Mampu membedakan merah, hijau, biru, dan kuning dengan baik. Tidak ditemukan pola buta warna pada tes ini.', saran: 'Tidak perlu tindak lanjut khusus. Ulangi skrining bila ada keluhan baru.' },
  { id: 'PROTANOPIA', nama: 'Protanopia (Buta Warna Merah Total)', labelParsial: 'Buta Warna Parsial Merah', kelompok: 'Merah-Hijau', deskripsi: 'Tidak ada fungsi sel kerucut merah (L-cone). Warna merah terlihat sangat gelap, seperti hitam atau coklat gelap, dan sulit dibedakan dari hijau.', saran: 'Periksa ke dokter mata / spesialis. Tes lanjutan: anomaloskop dan Farnsworth D-15. Perhatikan rambu dan lampu lalu lintas.' },
  { id: 'PROTANOMALY', nama: 'Protanomaly (Buta Warna Merah Parsial)', labelParsial: 'Buta Warna Parsial Merah', kelompok: 'Merah-Hijau', deskripsi: 'Sel kerucut merah berfungsi lemah. Merah terlihat lebih gelap dan kusam, tetapi masih bisa dibedakan pada warna yang terang dan jenuh.', saran: 'Periksa ke dokter mata untuk konfirmasi. Tes lanjutan: anomaloskop. Hindari pekerjaan yang mengandalkan merah gelap.' },
  { id: 'DEUTERANOPIA', nama: 'Deuteranopia (Buta Warna Hijau Total)', labelParsial: 'Buta Warna Parsial Hijau', kelompok: 'Merah-Hijau', deskripsi: 'Tidak ada fungsi sel kerucut hijau (M-cone). Hijau terlihat seperti coklat atau abu-abu dan sulit dibedakan dari merah.', saran: 'Periksa ke dokter mata / spesialis. Tes lanjutan: anomaloskop dan Farnsworth D-15.' },
  { id: 'DEUTERANOMALY', nama: 'Deuteranomaly (Buta Warna Hijau Parsial)', labelParsial: 'Buta Warna Parsial Hijau', kelompok: 'Merah-Hijau', deskripsi: 'Sel kerucut hijau berfungsi lemah. Ini jenis buta warna parsial yang paling umum. Hijau dan merah sering tertukar, terutama pada warna yang pudar.', saran: 'Periksa ke dokter mata untuk konfirmasi. Ini jenis paling umum dan biasanya tidak disadari sejak lama.' },
  { id: 'TRITANOPIA', nama: 'Tritanopia (Buta Warna Biru-Kuning Total)', labelParsial: 'Buta Warna Parsial Biru-Kuning', kelompok: 'Biru-Kuning', deskripsi: 'Tidak ada fungsi sel kerucut biru (S-cone). Biru terlihat seperti hijau, dan kuning terlihat seperti merah muda atau abu-abu.', saran: 'Periksa ke dokter mata. Tritanopia jarang bawaan lahir dan lebih sering terkait kondisi mata lain, jadi perlu diperiksa lebih lanjut.' },
  { id: 'TRITANOMALY', nama: 'Tritanomaly (Buta Warna Biru-Kuning Parsial)', labelParsial: 'Buta Warna Parsial Biru-Kuning', kelompok: 'Biru-Kuning', deskripsi: 'Sel kerucut biru berfungsi lemah. Biru dan kuning sulit dibedakan, tetapi masih bisa dikenali pada warna yang terang.', saran: 'Periksa ke dokter mata untuk konfirmasi dan tes lanjutan.' },
  { id: 'ACHROMATOPSIA', nama: 'Achromatopsia (Buta Warna Total)', labelParsial: 'Buta Warna Total', kelompok: 'Total', deskripsi: 'Tidak dapat melihat warna sama sekali; dunia terlihat hitam, putih, dan abu-abu. Sering disertai silau dan penglihatan yang kurang tajam.', saran: 'Segera periksa ke dokter mata / spesialis. Perlu pemeriksaan menyeluruh dan kacamata khusus bila diperlukan.' },
];

// Fakta turunan yang dipakai mesin inferensi (dihasilkan dari jawaban plat).
// Bukan premis input pengguna, melainkan fakta antara forward chaining.
export const FAKTA_TURUNAN = [
  'gagal_merah_hijau', 'banyak_gagal_merah_hijau', 'gagal_merah', 'banyak_gagal_merah',
  'gagal_hijau', 'banyak_gagal_hijau', 'gagal_biru_kuning', 'banyak_gagal_biru_kuning',
  'gagal_total', 'banyak_gagal_total', 'banyak_benar', 'sedikit_gagal',
  'kesulitan_merah', 'kesulitan_hijau', 'kesulitan_merah_hijau',
  'kesulitan_biru_kuning', 'kesulitan_total',
];

// Aturan forward chaining. premis = id fakta yang harus ada di memori kerja.
// konklusi = fakta baru ATAU id jenis diagnosis (NORMAL / PROTANOPIA / dst).
// CF = Certainty Factor menurut pakar (0-1).
export const ATURAN = [
  // --- Fakta antara: kesulitan dari gejala ---
  { id: 'R01', premis: ['G01', 'G02'], konklusi: 'kesulitan_merah', cf: 0.8, penjelasan: 'Sulit bedakan merah-hijau + merah terlihat gelap menunjukkan gangguan kerucut merah.' },
  { id: 'R02', premis: ['G01', 'G03'], konklusi: 'kesulitan_hijau', cf: 0.8, penjelasan: 'Sulit bedakan merah-hijau + hijau terlihat coklat/abu menunjukkan gangguan kerucut hijau.' },
  { id: 'R03', premis: ['G04', 'G05'], konklusi: 'kesulitan_merah_hijau', cf: 0.75, penjelasan: 'Merah dan hijau sama-sama tertukar dengan coklat = pola merah-hijau.' },
  { id: 'R04', premis: ['G08', 'G09'], konklusi: 'kesulitan_merah_hijau', cf: 0.7, penjelasan: 'Sering salah menyebut merah dan hijau.' },
  { id: 'R05', premis: ['G01', 'G10'], konklusi: 'kesulitan_merah_hijau', cf: 0.85, penjelasan: 'Sulit bedakan merah-hijau sampai ke lampu lalu lintas = bukti kuat merah-hijau.' },
  { id: 'R06', premis: ['G02', 'G04'], konklusi: 'kesulitan_merah', cf: 0.75, penjelasan: 'Merah gelap + tertukar coklat = gangguan merah.' },
  { id: 'R07', premis: ['G03', 'G05'], konklusi: 'kesulitan_hijau', cf: 0.75, penjelasan: 'Hijau coklat/abu + tertukar coklat = gangguan hijau.' },
  { id: 'R08', premis: ['G11', 'G15'], konklusi: 'kesulitan_biru_kuning', cf: 0.85, penjelasan: 'Biru tertukar hijau + biru terlihat hijau = gangguan kerucut biru.' },
  { id: 'R09', premis: ['G13', 'G14'], konklusi: 'kesulitan_biru_kuning', cf: 0.8, penjelasan: 'Kuning tertukar hijau muda + kuning pucat = gangguan biru-kuning.' },
  { id: 'R10', premis: ['G12', 'G15'], konklusi: 'kesulitan_biru_kuning', cf: 0.75, penjelasan: 'Biru tertukar ungu + biru terlihat hijau.' },
  { id: 'R11', premis: ['G16', 'G17'], konklusi: 'kesulitan_total', cf: 0.95, penjelasan: 'Warna pudar + hanya hitam-putih-abu = pola buta warna total.' },
  { id: 'R12', premis: ['G17', 'G18'], konklusi: 'kesulitan_total', cf: 0.9, penjelasan: 'Hanya hitam-putih-abu + sulit gelap-terang = achromatopsia.' },
  { id: 'R13', premis: ['G06', 'G23'], konklusi: 'kesulitan_hijau', cf: 0.7, penjelasan: 'Hijau tertukar kuning dan oranye = gangguan hijau.' },
  { id: 'R14', premis: ['G07', 'G22'], konklusi: 'kesulitan_merah', cf: 0.7, penjelasan: 'Merah tertukar oranye dan merah muda tertukar abu = gangguan merah.' },
  { id: 'R15', premis: ['G24', 'G01'], konklusi: 'kesulitan_merah_hijau', cf: 0.8, penjelasan: 'Sering dikoreksi soal warna + sulit merah-hijau.' },
  // --- Fakta antara: gagal plat ---
  { id: 'R16', premis: ['gagal_merah_hijau'], konklusi: 'kesulitan_merah_hijau', cf: 0.8, penjelasan: 'Gagal pada plat merah-hijau memperkuat kesulitan merah-hijau.' },
  { id: 'R17', premis: ['banyak_gagal_merah_hijau'], konklusi: 'kesulitan_merah_hijau', cf: 0.9, penjelasan: 'Gagal pada banyak plat merah-hijau = bukti sangat kuat.' },
  { id: 'R18', premis: ['gagal_merah'], konklusi: 'kesulitan_merah', cf: 0.8, penjelasan: 'Gagal pada plat khusus merah (protan).' },
  { id: 'R19', premis: ['banyak_gagal_merah'], konklusi: 'kesulitan_merah', cf: 0.9, penjelasan: 'Gagal pada banyak plat merah = gangguan merah berat.' },
  { id: 'R20', premis: ['gagal_hijau'], konklusi: 'kesulitan_hijau', cf: 0.8, penjelasan: 'Gagal pada plat khusus hijau (deutan).' },
  { id: 'R21', premis: ['banyak_gagal_hijau'], konklusi: 'kesulitan_hijau', cf: 0.9, penjelasan: 'Gagal pada banyak plat hijau = gangguan hijau berat.' },
  { id: 'R22', premis: ['gagal_biru_kuning'], konklusi: 'kesulitan_biru_kuning', cf: 0.8, penjelasan: 'Gagal pada plat biru-kuning (tritan).' },
  { id: 'R23', premis: ['banyak_gagal_biru_kuning'], konklusi: 'kesulitan_biru_kuning', cf: 0.9, penjelasan: 'Gagal pada banyak plat biru-kuning = gangguan biru-kuning berat.' },
  { id: 'R24', premis: ['gagal_total'], konklusi: 'kesulitan_total', cf: 0.8, penjelasan: 'Gagal pada plat kontras rendah tanpa warna kuat.' },
  { id: 'R25', premis: ['banyak_gagal_total'], konklusi: 'kesulitan_total', cf: 0.95, penjelasan: 'Gagal pada hampir semua plat termasuk plat total.' },
  // --- Diagnosis: normal ---
  { id: 'R26', premis: ['banyak_benar', 'sedikit_gagal'], konklusi: 'NORMAL', cf: 0.95, penjelasan: 'Hampir semua plat dijawab benar dan hampir tidak ada gejala = penglihatan warna normal.' },
  { id: 'R27', premis: ['banyak_benar'], konklusi: 'NORMAL', cf: 0.8, penjelasan: 'Sebagian besar plat benar, meski ada 1-2 gejala ringan.' },
  // --- Diagnosis: protan ---
  { id: 'R28', premis: ['kesulitan_merah', 'banyak_gagal_merah'], konklusi: 'PROTANOPIA', cf: 0.9, penjelasan: 'Gangguan merah + gagal banyak plat merah = protanopia (merah total). Merah terlihat sangat gelap.' },
  { id: 'R29', premis: ['kesulitan_merah', 'gagal_merah'], konklusi: 'PROTANOMALY', cf: 0.85, penjelasan: 'Gangguan merah + gagal sebagian plat merah = protanomaly (merah parsial).' },
  { id: 'R30', premis: ['kesulitan_merah', 'kesulitan_merah_hijau'], konklusi: 'PROTANOMALY', cf: 0.75, penjelasan: 'Gangguan merah dan merah-hijau tanpa kegagalan total = protanomaly.' },
  { id: 'R31', premis: ['G02', 'banyak_gagal_merah'], konklusi: 'PROTANOPIA', cf: 0.85, penjelasan: 'Merah terlihat gelap/hitam + gagal banyak plat merah = protanopia.' },
  { id: 'R32', premis: ['G02', 'gagal_merah'], konklusi: 'PROTANOMALY', cf: 0.8, penjelasan: 'Merah terlihat gelap + gagal sebagian plat merah = protanomaly.' },
  // --- Diagnosis: deutan ---
  { id: 'R33', premis: ['kesulitan_hijau', 'banyak_gagal_hijau'], konklusi: 'DEUTERANOPIA', cf: 0.9, penjelasan: 'Gangguan hijau + gagal banyak plat hijau = deuteranopia (hijau total).' },
  { id: 'R34', premis: ['kesulitan_hijau', 'gagal_hijau'], konklusi: 'DEUTERANOMALY', cf: 0.85, penjelasan: 'Gangguan hijau + gagal sebagian plat hijau = deuteranomaly (hijau parsial, paling umum).' },
  { id: 'R35', premis: ['kesulitan_hijau', 'kesulitan_merah_hijau'], konklusi: 'DEUTERANOMALY', cf: 0.75, penjelasan: 'Gangguan hijau dan merah-hijau tanpa kegagalan total = deuteranomaly.' },
  { id: 'R36', premis: ['G03', 'banyak_gagal_hijau'], konklusi: 'DEUTERANOPIA', cf: 0.85, penjelasan: 'Hijau terlihat coklat/abu + gagal banyak plat hijau = deuteranopia.' },
  { id: 'R37', premis: ['G03', 'gagal_hijau'], konklusi: 'DEUTERANOMALY', cf: 0.8, penjelasan: 'Hijau terlihat coklat/abu + gagal sebagian plat hijau = deuteranomaly.' },
  { id: 'R38', premis: ['kesulitan_merah_hijau', 'banyak_gagal_merah_hijau'], konklusi: 'DEUTERANOMALY', cf: 0.7, penjelasan: 'Kesulitan merah-hijau umum tanpa ciri merah yang dominan cenderung deutan (jenis paling umum).' },
  // --- Diagnosis: tritan ---
  { id: 'R39', premis: ['kesulitan_biru_kuning', 'banyak_gagal_biru_kuning'], konklusi: 'TRITANOPIA', cf: 0.9, penjelasan: 'Gangguan biru-kuning + gagal banyak plat biru-kuning = tritanopia.' },
  { id: 'R40', premis: ['kesulitan_biru_kuning', 'gagal_biru_kuning'], konklusi: 'TRITANOMALY', cf: 0.85, penjelasan: 'Gangguan biru-kuning + gagal sebagian plat biru-kuning = tritanomaly (biru-kuning parsial).' },
  { id: 'R41', premis: ['G15', 'banyak_gagal_biru_kuning'], konklusi: 'TRITANOPIA', cf: 0.85, penjelasan: 'Biru terlihat hijau + gagal banyak plat biru-kuning = tritanopia.' },
  { id: 'R42', premis: ['G15', 'gagal_biru_kuning'], konklusi: 'TRITANOMALY', cf: 0.8, penjelasan: 'Biru terlihat hijau + gagal sebagian plat biru-kuning = tritanomaly.' },
  // --- Diagnosis: total ---
  { id: 'R43', premis: ['kesulitan_total', 'banyak_gagal_total'], konklusi: 'ACHROMATOPSIA', cf: 0.95, penjelasan: 'Hanya hitam-putih-abu + gagal hampir semua plat = achromatopsia (buta warna total).' },
  { id: 'R44', premis: ['G17', 'banyak_gagal_merah_hijau'], konklusi: 'ACHROMATOPSIA', cf: 0.9, penjelasan: 'Hanya hitam-putih-abu + gagal banyak plat merah-hijau = achromatopsia.' },
  { id: 'R45', premis: ['kesulitan_total', 'kesulitan_merah_hijau'], konklusi: 'ACHROMATOPSIA', cf: 0.85, penjelasan: 'Kesulitan total + kesulitan merah-hijau = achromatopsia.' },
  // --- Diagnosis: parsial merah-hijau (label umum, dipetakan ke jenis spesifik) ---
  { id: 'R46', premis: ['kesulitan_merah_hijau', 'gagal_merah_hijau'], konklusi: 'PROTANOMALY', cf: 0.6, penjelasan: 'Kesulitan merah-hijau parsial dengan ciri merah lebih menonjol.' },
  { id: 'R47', premis: ['kesulitan_merah_hijau', 'gagal_merah_hijau'], konklusi: 'DEUTERANOMALY', cf: 0.65, penjelasan: 'Kesulitan merah-hijau parsial; deutan adalah kemungkinan paling umum.' },
  { id: 'R48', premis: ['G01', 'gagal_merah_hijau'], konklusi: 'DEUTERANOMALY', cf: 0.6, penjelasan: 'Sulit bedakan merah-hijau + gagal plat merah-hijau = buta warna parsial merah-hijau (cenderung deutan).' },
  { id: 'R49', premis: ['G01', 'gagal_merah_hijau'], konklusi: 'PROTANOMALY', cf: 0.55, penjelasan: 'Sulit bedakan merah-hijau + gagal plat merah-hijau = buta warna parsial merah-hijau (kemungkinan protan).' },
  { id: 'R50', premis: ['kesulitan_biru_kuning', 'gagal_biru_kuning'], konklusi: 'TRITANOMALY', cf: 0.6, penjelasan: 'Kesulitan biru-kuning parsial.' },
  // --- Aturan penguat / penjelas ---
  { id: 'R51', premis: ['G21', 'kesulitan_merah_hijau'], konklusi: 'DEUTERANOMALY', cf: 0.5, penjelasan: 'Riwayat keluarga + kesulitan merah-hijau memperkuat dugaan bawaan (paling sering deutan).' },
  { id: 'R52', premis: ['G19', 'G20', 'kesulitan_merah_hijau'], konklusi: 'DEUTERANOMALY', cf: 0.5, penjelasan: 'Mata lelah + kesulitan kerja warna + kesulitan merah-hijau.' },
  { id: 'R53', premis: ['G24', 'banyak_gagal_merah_hijau'], konklusi: 'DEUTERANOPIA', cf: 0.6, penjelasan: 'Sering dikoreksi soal warna + gagal banyak plat merah-hijau.' },
  { id: 'R54', premis: ['G24', 'banyak_gagal_total'], konklusi: 'ACHROMATOPSIA', cf: 0.6, penjelasan: 'Sering dikoreksi soal warna + gagal total.' },
  { id: 'R55', premis: ['kesulitan_merah', 'banyak_gagal_merah_hijau'], konklusi: 'PROTANOPIA', cf: 0.7, penjelasan: 'Gangguan merah + gagal banyak plat merah-hijau.' },
  { id: 'R56', premis: ['kesulitan_hijau', 'banyak_gagal_merah_hijau'], konklusi: 'DEUTERANOPIA', cf: 0.7, penjelasan: 'Gangguan hijau + gagal banyak plat merah-hijau.' },
  { id: 'R57', premis: ['kesulitan_biru_kuning', 'banyak_gagal_biru_kuning', 'G14'], konklusi: 'TRITANOPIA', cf: 0.7, penjelasan: 'Gangguan biru-kuning + kuning pucat + gagal banyak plat biru-kuning.' },
  { id: 'R58', premis: ['banyak_benar', 'kesulitan_merah_hijau'], konklusi: 'NORMAL', cf: 0.4, penjelasan: 'Meski ada gejala ringan, sebagian besar plat benar — kemungkinan normal dengan gejala ringan, perlu tes lanjutan.' },
];

export const PLATES = ISHIHARA_PLATES;

export const JUMLAH_PREMIS = GEJALA.length + ISHIHARA_PLATES.length; // 48
export const JUMLAH_ATURAN = ATURAN.length; // 58

export function getGejalaById(id) { return GEJALA.find((g) => g.id === id); }
export function getJenisById(id) { return JENIS_BUTA_WARNA.find((j) => j.id === id); }
export function getAturanById(id) { return ATURAN.find((r) => r.id === id); }
