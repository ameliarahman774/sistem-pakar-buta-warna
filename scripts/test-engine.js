// Tes mesin inferensi (Node, tanpa React Native).
// Jalankan: node scripts/test-engine.js
// Persona: Normal, Protan, Deutan — assert premis >45, aturan >=50,
// dan diagnosis sesuai persona.
import { forwardChaining } from '../src/engine/forwardChaining.js';
import { bangunPenjelasan } from '../src/engine/explain.js';
import { GEJALA, ATURAN, JUMLAH_PREMIS, JUMLAH_ATURAN } from '../src/data/knowledgeBase.js';
import { ISHIHARA_PLATES } from '../src/data/ishiharaPlates.js';

function assert(kondisi, pesan) {
  if (!kondisi) { console.error('GAGAL: ' + pesan); process.exitCode = 1; throw new Error(pesan); }
  console.log('OK: ' + pesan);
}

function jawabanSemuaBenar() {
  const j = {}; ISHIHARA_PLATES.forEach((p) => { j[p.id] = p.angkaBenar; }); return j;
}
function jawabanGagal(kategoriList) {
  const j = jawabanSemuaBenar();
  ISHIHARA_PLATES.forEach((p) => { if (kategoriList.includes(p.kategori)) j[p.id] = 'tidak terlihat'; });
  return j;
}

console.log('=== Sistem Pakar Buta Warna — Test Engine ===');
console.log(`Premis: ${JUMLAH_PREMIS} (gejala ${GEJALA.length} + plat ${ISHIHARA_PLATES.length})`);
console.log(`Aturan: ${JUMLAH_ATURAN}`);
assert(JUMLAH_PREMIS > 45, `jumlah premis > 45 (dapat ${JUMLAH_PREMIS})`);
assert(JUMLAH_ATURAN >= 50, `jumlah aturan >= 50 (dapat ${JUMLAH_ATURAN})`);
assert(new Set(GEJALA.map((g) => g.id)).size === 24, '24 gejala unik G01-G24');
assert(new Set(ISHIHARA_PLATES.map((p) => p.id)).size === 24, '24 plat unik P01-P24');

// 1) Persona Normal
const normal = forwardChaining({ gejalaTerpilih: [], jawabanPlat: jawabanSemuaBenar() });
console.log(`\n[Normal] diagnosis=${normal.diagnosis} CF=${normal.cfPersen}% aturanTerpicu=${normal.aturanTerpicu.map((r) => r.id).join(',')}`);
assert(normal.diagnosis === 'NORMAL', `persona Normal -> NORMAL (dapat ${normal.diagnosis})`);
assert(normal.cf >= 0.8, `persona Normal CF >= 80% (dapat ${normal.cfPersen}%)`);

// 2) Persona Protan TOTAL — gejala merah + gagal SEMUA plat merah & merah-hijau
const protan = forwardChaining({
  gejalaTerpilih: ['G01', 'G02', 'G04', 'G07', 'G08'],
  jawabanPlat: jawabanGagal(['merah', 'merah-hijau']),
});
console.log(`\n[Protan] diagnosis=${protan.diagnosis} CF=${protan.cfPersen}% hipotesis=${protan.hipotesis.map((h) => h.id + ':' + Math.round(h.cf * 100) + '%').join(', ')}`);
console.log('Penjelasan:', bangunPenjelasan(protan)[0]);
assert(protan.diagnosis === 'PROTANOPIA', `persona Protan total -> PROTANOPIA (dapat ${protan.diagnosis})`);
assert(!protan.hipotesis.some((h) => h.id === 'ACHROMATOPSIA' && h.cf > 0.8), 'persona Protan tidak salah dikira Achromatopsia');
assert(protan.cf >= 0.7, `persona Protan CF >= 70% (dapat ${protan.cfPersen}%)`);
assert(protan.aturanTerpicu.length >= 3, `persona Protan memicu >=3 aturan (dapat ${protan.aturanTerpicu.length})`);
assert(protan.trace.length >= 3, 'persona Protan punya jejak forward chaining');

// 3) Persona Deutan TOTAL — gejala hijau + gagal SEMUA plat hijau & merah-hijau
const deutan = forwardChaining({
  gejalaTerpilih: ['G01', 'G03', 'G05', 'G06', 'G09'],
  jawabanPlat: jawabanGagal(['hijau', 'merah-hijau']),
});
console.log(`\n[Deutan] diagnosis=${deutan.diagnosis} CF=${deutan.cfPersen}% hipotesis=${deutan.hipotesis.map((h) => h.id + ':' + Math.round(h.cf * 100) + '%').join(', ')}`);
console.log('Penjelasan:', bangunPenjelasan(deutan)[0]);
assert(deutan.diagnosis === 'DEUTERANOPIA', `persona Deutan total -> DEUTERANOPIA (dapat ${deutan.diagnosis})`);
assert(!deutan.hipotesis.some((h) => h.id === 'ACHROMATOPSIA' && h.cf > 0.8), 'persona Deutan tidak salah dikira Achromatopsia');

// 4) Persona Deutan PARSIAL — hanya gagal sebagian plat hijau (2 dari 4)
const jawabanParsial = jawabanSemuaBenar();
['P15', 'P16'].forEach((id) => { jawabanParsial[id] = 'tidak terlihat'; });
['P03', 'P05'].forEach((id) => { jawabanParsial[id] = 'tidak terlihat'; });
const parsial = forwardChaining({ gejalaTerpilih: ['G01', 'G03', 'G09'], jawabanPlat: jawabanParsial });
console.log(`\n[Deutan parsial] diagnosis=${parsial.diagnosis} CF=${parsial.cfPersen}%`);
assert(parsial.diagnosis === 'DEUTERANOMALY', `persona Deutan parsial -> DEUTERANOMALY (dapat ${parsial.diagnosis})`);
assert(deutan.cf >= 0.7, `persona Deutan CF >= 70% (dapat ${deutan.cfPersen}%)`);

// 5) Plat & jenis dari database harus benar-benar dipakai mesin inferensi
const platUji = ISHIHARA_PLATES.map((p) => (p.id === 'P01' ? { ...p, angkaBenar: '99' } : p));
const jawabanPlatUji = jawabanSemuaBenar();
jawabanPlatUji.P01 = '99';
const jenisUji = [
  { id: 'NORMAL', nama: 'Normal Uji Database', labelParsial: 'Normal', kelompok: 'Normal', deskripsi: '', saran: '' },
];
const ujiDatabase = forwardChaining({ gejalaTerpilih: [], jawabanPlat: jawabanPlatUji, plates: platUji, jenis: jenisUji });
assert(ujiDatabase.buktiPlat.find((b) => b.platId === 'P01').jawabanBenar === '99', 'plat dari database dipakai untuk bukti jawaban');
assert(ujiDatabase.diagnosisNama === 'Normal Uji Database', 'metadata jenis dari database dipakai untuk diagnosis');

// Bukti per plat: contoh buta warna parsial harus menyebut warna yang benar
const buktiGagal = protan.buktiPlat.find((b) => b.gagal);
assert(buktiGagal && buktiGagal.jawabanBenar && buktiGagal.pasanganWarnaTertukar, 'bukti per plat memuat jawaban benar + warna tertukar');
console.log(`\nContoh bukti plat Protan: ${buktiGagal.platId} jawab "${buktiGagal.jawabanUser}", benar "${buktiGagal.jawabanBenar}", tertukar: ${buktiGagal.pasanganWarnaTertukar}`);

if (process.exitCode) console.log('\nADA TES YANG GAGAL.');
else console.log('\nSEMUA TES LOLOS.');
