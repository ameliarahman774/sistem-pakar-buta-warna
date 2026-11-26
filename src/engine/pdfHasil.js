// Generator HTML untuk PDF hasil konsultasi.
// Dipakai tombol Unduh PDF di HP (expo-print).
import { jelaskanPerPlat, bangunPenjelasan } from './explain.js';

function esc(teks) {
  return String(teks ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buatHtmlHasil({ nama, umur, tanggal, hasil }) {
  const waktu = new Date(tanggal);
  const tanggalTes = waktu.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const waktuTes = waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const bukti = jelaskanPerPlat(hasil.buktiPlat);
  const gagal = bukti.filter((b) => b.gagal);
  const barisPlat = bukti.map((b) => `
    <tr>
      <td>${b.nomor}</td>
      <td>${esc(b.jawabanUser)}</td>
      <td>${esc(b.jawabanBenar)}</td>
      <td>${esc(b.warnaTarget)} di atas ${esc(b.warnaLatar)}</td>
      <td>${esc(b.pasanganWarnaTertukar)}</td>
      <td>${b.benar ? 'Benar' : b.ragu ? 'Ragu' : 'Salah / tidak terlihat'}</td>
    </tr>`).join('');
  const daftarGejala = hasil.buktiGejala.length === 0
    ? '<li>Tidak ada gejala yang dipilih.</li>'
    : hasil.buktiGejala.map((g) => `<li>${esc(g.teks)}</li>`).join('');
  const daftarWarnaBenar = gagal.length === 0
    ? '<li>Semua plat dijawab benar — tidak ada warna yang gagal dibedakan.</li>'
    : gagal.map((b) => `<li>Plat ${b.nomor}: seharusnya ${esc(b.warnaTarget)} di atas ${esc(b.warnaLatar)} (angka ${esc(b.jawabanBenar)}), bukan ${esc(b.pasanganWarnaTertukar)} yang tampak sama.</li>`).join('');
  const penjelasan = bangunPenjelasan(hasil).map((b) => `<li>${esc(b)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 32px; font-size: 13px; line-height: 1.5; }
  h1 { font-size: 20px; text-align: center; margin-bottom: 4px; }
  .sub { text-align: center; color: #555; margin-bottom: 20px; }
  h2 { font-size: 15px; margin-top: 18px; margin-bottom: 6px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #ccc; padding: 5px 6px; text-align: left; font-size: 11.5px; }
  th { background: #f2f6ff; }
  .identitas td:first-child { width: 140px; font-weight: bold; background: #fafafa; }
  .hasil { background: #e8f5e9; padding: 12px; border-radius: 8px; margin-top: 10px; }
  .diagnosis { font-size: 17px; font-weight: bold; }
  ul { margin-top: 4px; }
  .disclaimer { color: #777; font-size: 11px; margin-top: 16px; }
</style>
</head>
<body>
  <h1>Hasil Konsultasi Sistem Pakar Buta Warna</h1>
  <div class="sub">Dokumen hasil skrining warna</div>

  <h2>Identitas &amp; Waktu Tes</h2>
  <table class="identitas">
    <tr><td>Nama</td><td>${esc(nama || '-')}</td></tr>
    <tr><td>Umur</td><td>${esc(umur || '-')}</td></tr>
    <tr><td>Tanggal tes</td><td>${esc(tanggalTes)}</td></tr>
    <tr><td>Waktu tes</td><td>${esc(waktuTes)}</td></tr>
  </table>

  <div class="hasil">
    <div class="diagnosis">${esc(hasil.diagnosisNama)}</div>
    <div>Label: ${esc(hasil.labelParsial)} • Kelompok: ${esc(hasil.kelompok)}</div>
    <div><b>Keyakinan (CF): ${hasil.cfPersen}%</b></div>
  </div>

  <h2>Kenapa Hasil Ini?</h2>
  <ul>${penjelasan}</ul>

  <h2>Bukti per Plat</h2>
  <table>
    <tr><th>Plat</th><th>Jawaban</th><th>Jawaban Benar</th><th>Warna Plat</th><th>Warna Tertukar</th><th>Status</th></tr>
    ${barisPlat}
  </table>

  <h2>Bukti Gejala</h2>
  <ul>${daftarGejala}</ul>

  <h2>Warna yang Benar Seharusnya</h2>
  <ul>${daftarWarnaBenar}</ul>

  <h2>Saran Tindak Lanjut</h2>
  <p>${esc(hasil.hipotesis[0]?.saran || 'Periksa ke dokter mata untuk konfirmasi.')}</p>
  <p class="disclaimer">Disclaimer: ini skrining awal, bukan diagnosis medis. Periksa ke dokter mata / tes lanjutan (anomaloskop, Farnsworth D-15) untuk kepastian.</p>
</body>
</html>`;
}
