// Membuat file PDF hasil konsultasi (teks asli, bukan tangkapan layar).
// Web: PDF dibuat dengan jsPDF lalu diunduh/dibagikan sebagai file.
// HP (Expo Go): dialog cetak sistem dibuka dari HTML hasil, pengguna
// menyimpannya sebagai PDF dari dialog itu (tanpa expo-sharing).
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import { buatHtmlHasil } from './pdfHasil';
import { jelaskanPerPlat, bangunPenjelasan } from './explain';

function namaFilePdf(nama) {
  const bersih = String(nama || 'hasil').replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'hasil';
  return `hasil-buta-warna-${bersih}.pdf`;
}

function buatDokumenWeb({ nama, umur, tanggal, hasil }) {
  // require di dalam fungsi supaya jsPDF hanya dieksekusi di web.
  const { jsPDF } = require('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const lebar = 210;
  const margin = 15;
  const lebarTeks = lebar - margin * 2;
  let y = 18;
  const cekHalaman = (butuh = 8) => {
    if (y + butuh > 285) { doc.addPage(); y = 18; }
  };
  const tulis = (teks, { ukuran = 11, tebal = false, jarak = 5, rata = 'left' } = {}) => {
    doc.setFont('helvetica', tebal ? 'bold' : 'normal');
    doc.setFontSize(ukuran);
    const baris = doc.splitTextToSize(String(teks ?? ''), lebarTeks);
    for (const b of baris) {
      cekHalaman(jarak + 2);
      doc.text(b, rata === 'center' ? lebar / 2 : margin, y, { align: rata });
      y += jarak;
    }
  };
  const judulBagian = (teks) => { y += 3; tulis(teks, { ukuran: 13, tebal: true, jarak: 6 }); };

  const waktu = new Date(tanggal);
  const tanggalTes = waktu.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const waktuTes = waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const bukti = jelaskanPerPlat(hasil.buktiPlat);
  const gagal = bukti.filter((b) => b.gagal);

  tulis('Hasil Konsultasi Sistem Pakar Buta Warna', { ukuran: 17, tebal: true, jarak: 7, rata: 'center' });
  tulis('Dokumen hasil skrining warna', { ukuran: 10, jarak: 6, rata: 'center' });
  judulBagian('Identitas & Waktu Tes');
  tulis(`Nama: ${nama || '-'}`);
  tulis(`Umur: ${umur || '-'}`);
  tulis(`Tanggal tes: ${tanggalTes}`);
  tulis(`Waktu tes: ${waktuTes}`);
  judulBagian('Hasil');
  tulis(hasil.diagnosisNama, { ukuran: 14, tebal: true, jarak: 6 });
  tulis(`Label: ${hasil.labelParsial} | Kelompok: ${hasil.kelompok}`);
  tulis(`Keyakinan (CF): ${hasil.cfPersen}%`, { tebal: true });
  judulBagian('Kenapa Hasil Ini?');
  bangunPenjelasan(hasil).forEach((b) => tulis(`- ${b}`));
  judulBagian('Bukti per Plat');
  bukti.forEach((b) => {
    const status = b.benar ? 'Benar' : b.ragu ? 'Ragu' : 'Salah / tidak terlihat';
    tulis(`Plat ${b.nomor}: jawab "${b.jawabanUser}", benar "${b.jawabanBenar}" — ${status}. Warna: ${b.warnaTarget} di atas ${b.warnaLatar}. Tertukar: ${b.pasanganWarnaTertukar}.`, { ukuran: 10 });
  });
  judulBagian('Bukti Gejala');
  if (hasil.buktiGejala.length === 0) tulis('- Tidak ada gejala yang dipilih.');
  else hasil.buktiGejala.forEach((g) => tulis(`- ${g.teks}`));
  judulBagian('Warna yang Benar Seharusnya');
  if (gagal.length === 0) tulis('- Semua plat dijawab benar — tidak ada warna yang gagal dibedakan.');
  else gagal.forEach((b) => tulis(`- Plat ${b.nomor}: seharusnya ${b.warnaTarget} di atas ${b.warnaLatar} (angka ${b.jawabanBenar}), bukan ${b.pasanganWarnaTertukar} yang tampak sama.`));
  judulBagian('Saran Tindak Lanjut');
  tulis(hasil.hipotesis[0]?.saran || 'Periksa ke dokter mata untuk konfirmasi.');
  y += 4;
  tulis('Disclaimer: ini skrining awal, bukan diagnosis medis. Periksa ke dokter mata / tes lanjutan (anomaloskop, Farnsworth D-15) untuk kepastian.', { ukuran: 9, jarak: 4 });
  return doc;
}

async function unduhWeb(data) {
  const doc = buatDokumenWeb(data);
  doc.save(namaFilePdf(data.nama));
}

export async function unduhHasilPdf(data) {
  if (Platform.OS === 'web') { await unduhWeb(data); return; }
  await Print.printAsync({ html: buatHtmlHasil(data) });
}
