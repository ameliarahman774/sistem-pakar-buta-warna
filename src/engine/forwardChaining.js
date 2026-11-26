// Mesin inferensi Forward Chaining — MURNI JavaScript, tanpa import react-native.
// Bisa dijalankan dengan Node untuk testing (scripts/test-engine.js).
//
// Input:
//   { gejalaTerpilih: ['G01','G02',...],
//     jawabanPlat: { P01: '12' | 'tidak terlihat' | 'ragu', ... },
//     aturan: [...] (opsional, default dari knowledgeBase),
//     gejala: [...], plates: [...], jenis: [...] }
// Output:
//   { diagnosis, diagnosisNama, cf, hipotesis, trace, aturanTerpicu,
//     faktaAwal, faktaAkhir, buktiPlat, buktiGejala, ringkasan }

import { GEJALA, ATURAN, JENIS_BUTA_WARNA, JUMLAH_PREMIS, JUMLAH_ATURAN } from '../data/knowledgeBase.js';
import { ISHIHARA_PLATES } from '../data/ishiharaPlates.js';

export { JUMLAH_PREMIS, JUMLAH_ATURAN };

function gabungCF(cfLama, cfBaru) {
  if (cfLama == null) return cfBaru;
  // CF gabungan standar, dibatasi 0.97 supaya tidak pernah klaim 100% pasti.
  return Math.min(0.97, cfLama + cfBaru * (1 - cfLama));
}

function normalisasiJawaban(jawaban) {
  if (jawaban == null) return 'tidak terlihat';
  const s = String(jawaban).trim().toLowerCase();
  if (s === '' || s === 'tidak terlihat' || s === 'tidak tahu' || s === 'tidak kelihatan') return 'tidak terlihat';
  if (s === 'ragu' || s === 'ragu-ragu') return 'ragu';
  return s;
}

export function hitungBuktiPlat(jawabanPlat, plates = ISHIHARA_PLATES) {
  return plates.map((plat) => {
    const mentah = jawabanPlat ? jawabanPlat[plat.id] : undefined;
    const jawaban = normalisasiJawaban(mentah);
    const benar = jawaban === String(plat.angkaBenar).toLowerCase();
    const ragu = jawaban === 'ragu';
    return {
      platId: plat.id, nomor: plat.nomor, kategori: plat.kategori,
      jawabanUser: mentah == null || String(mentah).trim() === '' ? 'tidak terlihat' : String(mentah),
      jawabanBenar: plat.angkaBenar, benar, ragu, gagal: !benar && !ragu,
      warnaTarget: plat.warnaTarget, warnaLatar: plat.warnaLatar,
      pasanganWarnaTertukar: plat.pasanganWarnaTertukar, arti: plat.arti,
    };
  });
}

export function forwardChaining(input) {
  const gejalaTerpilih = input.gejalaTerpilih || [];
  const jawabanPlat = input.jawabanPlat || {};
  const aturan = input.aturan || ATURAN;
  const plates = input.plates || ISHIHARA_PLATES;
  const gejalaList = input.gejala || GEJALA;
  const jenisList = input.jenis?.length ? input.jenis : JENIS_BUTA_WARNA;
  const diagnosisIds = new Set(jenisList.map((j) => j.id));

  const buktiPlat = hitungBuktiPlat(jawabanPlat, plates);
  const buktiGejala = gejalaTerpilih.map((id) => gejalaList.find((g) => g.id === id)).filter(Boolean);

  // --- Fakta awal ---
  const fakta = new Set(gejalaTerpilih);
  const faktaAwal = [...gejalaTerpilih];
  buktiPlat.forEach((b) => {
    if (b.benar) fakta.add(`benar_${b.platId}`);
    else if (b.ragu) fakta.add(`ragu_${b.platId}`);
    else fakta.add(`gagal_${b.platId}`);
  });

  // --- Fakta turunan dari hitungan plat (langkah 0, dicatat di trace) ---
  const hitung = (kategori) => buktiPlat.filter((b) => b.kategori === kategori && b.gagal).length;
  const gagalMH = hitung('merah-hijau');
  const gagalMerah = hitung('merah');
  const gagalHijau = hitung('hijau');
  const gagalBK = hitung('biru-kuning');
  const gagalTotal = hitung('total');
  const jumlahBenar = buktiPlat.filter((b) => b.benar).length;
  const jumlahGagal = buktiPlat.filter((b) => b.gagal).length;

  const trace = [];
  const tambahFaktaTurunan = (idFakta, alasan) => {
    if (!fakta.has(idFakta)) {
      fakta.add(idFakta);
      trace.push({ langkah: trace.length + 1, jenis: 'fakta-turunan', fakta: idFakta, alasan });
    }
  };
  // Ambang "banyak gagal" menyesuaikan jumlah plat yang dipakai sesi ini
  // (tes memakai 15 plat pilihan; basis pengetahuan tetap 24 plat).
  const jumlahKategori = (kategori) => buktiPlat.filter((b) => b.kategori === kategori).length;
  const ambangBanyak = (kategori, ambangPenuh, ambangSubset) => (jumlahKategori(kategori) >= 4 ? ambangPenuh : ambangSubset);
  const ambangMH = ambangBanyak('merah-hijau', 4, 3);
  const ambangMerah = ambangBanyak('merah', 3, 2);
  const ambangHijau = ambangBanyak('hijau', 3, 2);
  const ambangBK = ambangBanyak('biru-kuning', 3, 2);
  const ambangBanyakBenar = Math.ceil(plates.length * 0.8);
  const ambangGagalTotal = Math.ceil(plates.length * 0.75);
  if (gagalMH >= 1) tambahFaktaTurunan('gagal_merah_hijau', `Gagal ${gagalMH} plat merah-hijau`);
  if (gagalMH >= ambangMH) tambahFaktaTurunan('banyak_gagal_merah_hijau', `Gagal ${gagalMH} plat merah-hijau (>=${ambangMH})`);
  if (gagalMerah >= 1) tambahFaktaTurunan('gagal_merah', `Gagal ${gagalMerah} plat merah`);
  if (gagalMerah >= ambangMerah) tambahFaktaTurunan('banyak_gagal_merah', `Gagal ${gagalMerah} plat merah (>=${ambangMerah})`);
  if (gagalHijau >= 1) tambahFaktaTurunan('gagal_hijau', `Gagal ${gagalHijau} plat hijau`);
  if (gagalHijau >= ambangHijau) tambahFaktaTurunan('banyak_gagal_hijau', `Gagal ${gagalHijau} plat hijau (>=${ambangHijau})`);
  if (gagalBK >= 1) tambahFaktaTurunan('gagal_biru_kuning', `Gagal ${gagalBK} plat biru-kuning`);
  if (gagalBK >= ambangBK) tambahFaktaTurunan('banyak_gagal_biru_kuning', `Gagal ${gagalBK} plat biru-kuning (>=${ambangBK})`);
  if (gagalTotal >= 1) tambahFaktaTurunan('gagal_total', `Gagal ${gagalTotal} plat total`);
  // Banyak-gagal-total HANYA bila plat totalnya sendiri gagal (bukan sekadar
  // banyak gagal merah-hijau). Kalau tidak, persona protan/deutan total
  // akan salah dikira achromatopsia.
  if (gagalTotal >= 2 || (gagalTotal >= 1 && jumlahGagal >= ambangGagalTotal)) tambahFaktaTurunan('banyak_gagal_total', `Gagal ${gagalTotal} plat total dan ${jumlahGagal} dari ${plates.length} plat`);
  if (jumlahBenar >= ambangBanyakBenar) tambahFaktaTurunan('banyak_benar', `Benar ${jumlahBenar} dari ${plates.length} plat (>=${ambangBanyakBenar})`);
  if (jumlahGagal <= 2) tambahFaktaTurunan('sedikit_gagal', `Hanya gagal ${jumlahGagal} plat (<=2)`);

  // --- Forward chaining: ulangi sampai tidak ada aturan baru yang terpicu ---
  const aturanTerpicu = [];
  const cfPerDiagnosis = {};
  const aturanPerDiagnosis = {};
  let berubah = true;
  let putaran = 0;
  while (berubah && putaran < 20) {
    berubah = false;
    putaran += 1;
    for (const aturanItem of aturan) {
      if (aturanTerpicu.some((t) => t.id === aturanItem.id)) continue;
      const premisTerpenuhi = aturanItem.premis.every((p) => fakta.has(p));
      if (!premisTerpenuhi) continue;
      // Catat aturan terpicu
      aturanTerpicu.push(aturanItem);
      trace.push({
        langkah: trace.length + 1, jenis: 'aturan', aturanId: aturanItem.id,
        premis: [...aturanItem.premis], konklusi: aturanItem.konklusi,
        cf: aturanItem.cf, penjelasan: aturanItem.penjelasan,
      });
      if (diagnosisIds.has(aturanItem.konklusi)) {
        cfPerDiagnosis[aturanItem.konklusi] = gabungCF(cfPerDiagnosis[aturanItem.konklusi], aturanItem.cf);
        aturanPerDiagnosis[aturanItem.konklusi] = (aturanPerDiagnosis[aturanItem.konklusi] || 0) + 1;
      } else if (!fakta.has(aturanItem.konklusi)) {
        fakta.add(aturanItem.konklusi);
        berubah = true;
      }
    }
  }

  // --- Total vs parsial saling meniadakan dalam satu keluarga ---
  // Kalau gagal total pada warna itu banyak, bentuk TOTAL yang menang dan
  // bentuk parsial diturunkan; kalau tidak, parsial yang menang.
  // Ini mencegah Protanopia dan Protanomaly sama-sama 100%.
  const selesaikanKeluarga = (total, parsial, faktaBanyak) => {
    if (cfPerDiagnosis[total] != null && cfPerDiagnosis[parsial] != null) {
      if (fakta.has(faktaBanyak)) cfPerDiagnosis[parsial] = cfPerDiagnosis[parsial] * 0.55;
      else cfPerDiagnosis[total] = cfPerDiagnosis[total] * 0.55;
    }
  };
  selesaikanKeluarga('PROTANOPIA', 'PROTANOMALY', 'banyak_gagal_merah');
  selesaikanKeluarga('DEUTERANOPIA', 'DEUTERANOMALY', 'banyak_gagal_hijau');
  selesaikanKeluarga('TRITANOPIA', 'TRITANOMALY', 'banyak_gagal_biru_kuning');

  // --- Pilih diagnosis utama ---
  const hipotesis = Object.entries(cfPerDiagnosis)
    .map(([id, cf]) => {
      const jenis = jenisList.find((j) => j.id === id);
      return { id, nama: jenis ? jenis.nama : id, labelParsial: jenis ? jenis.labelParsial : id, kelompok: jenis ? jenis.kelompok : '', cf, deskripsi: jenis ? jenis.deskripsi : '', saran: jenis ? jenis.saran : '' };
    })
    .sort((a, b) => {
      if (Math.abs(b.cf - a.cf) > 0.001) return b.cf - a.cf;
      // Seri CF (sering mentok di cap 0.97): achromatopsia menang bila plat
      // total ikut gagal, lalu diagnosis dengan aturan pendukung lebih
      // banyak, dan NORMAL kalah seri dari diagnosis spesifik.
      const skorSeri = (h) => (h.id === 'ACHROMATOPSIA' && fakta.has('banyak_gagal_total') ? 100 : 0)
        + (aturanPerDiagnosis[h.id] || 0)
        + (h.id === 'NORMAL' ? -50 : 0);
      return skorSeri(b) - skorSeri(a);
    });

  // Fallback: bila tidak ada diagnosis (misal jawaban kosong), tentukan dari hitungan.
  let diagnosis = hipotesis[0] || null;
  if (!diagnosis) {
    if (jumlahGagal === 0 && gejalaTerpilih.length === 0) {
      diagnosis = { id: 'NORMAL', nama: 'Penglihatan Warna Normal', labelParsial: 'Normal', kelompok: 'Normal', cf: 0.9, deskripsi: '', saran: '' };
    } else if (gagalMH >= 3) {
      diagnosis = { id: 'DEUTERANOMALY', nama: 'Deuteranomaly (Buta Warna Hijau Parsial)', labelParsial: 'Buta Warna Parsial Hijau', kelompok: 'Merah-Hijau', cf: 0.6, deskripsi: '', saran: '' };
    } else {
      diagnosis = { id: 'NORMAL', nama: 'Penglihatan Warna Normal', labelParsial: 'Normal', kelompok: 'Normal', cf: 0.5, deskripsi: '', saran: '' };
    }
    hipotesis.push(diagnosis);
  }

  return {
    diagnosis: diagnosis.id,
    diagnosisNama: diagnosis.nama,
    labelParsial: diagnosis.labelParsial,
    kelompok: diagnosis.kelompok,
    cf: diagnosis.cf,
    cfPersen: Math.round(diagnosis.cf * 100),
    hipotesis,
    aturanTerpicu,
    trace,
    faktaAwal,
    faktaAkhir: [...fakta],
    buktiPlat,
    buktiGejala,
    statistik: { jumlahBenar, jumlahGagal, gagalMH, gagalMerah, gagalHijau, gagalBK, gagalTotal, jumlahGejala: gejalaTerpilih.length },
  };
}

export default forwardChaining;
