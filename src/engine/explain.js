// Penjelasan hasil — membangun narasi "kenapa hasil ini?" dari bukti.
// Murni JS, tanpa import react-native, supaya bisa dites dengan Node.

export function jelaskanPerPlat(buktiPlat) {
  return buktiPlat.map((b) => {
    if (b.benar) {
      return {
        ...b,
        penjelasan: `Plat ${b.nomor}: kamu menjawab ${b.jawabanUser}, benar. Angka ${b.jawabanBenar} memang dibentuk titik ${b.warnaTarget} di atas latar ${b.warnaLatar}, dan kamu bisa membedakannya.`,
      };
    }
    if (b.ragu) {
      return {
        ...b,
        penjelasan: `Plat ${b.nomor}: kamu ragu-ragu. Jawaban yang benar seharusnya ${b.jawabanBenar} (${b.warnaTarget} di atas ${b.warnaLatar}). Keraguan di plat ${b.pasanganWarnaTertukar} adalah tanda parsial.`,
      };
    }
    return {
      ...b,
      penjelasan: `Plat ${b.nomor}: kamu menjawab "${b.jawabanUser}", padahal jawaban yang benar adalah "${b.jawabanBenar}". Angka itu dibentuk titik ${b.warnaTarget} di atas latar ${b.warnaLatar} — kamu tidak bisa membedakan ${b.pasanganWarnaTertukar}, sehingga angka yang terlihat berbeda / tidak terlihat. ${b.arti}`,
    };
  });
}

export function bangunPenjelasan(hasil) {
  const gagal = hasil.buktiPlat.filter((b) => b.gagal);
  const benar = hasil.buktiPlat.filter((b) => b.benar);
  const warnaGagal = [...new Set(gagal.map((b) => b.pasanganWarnaTertukar))];
  const baris = [];
  baris.push(`Hasil: ${hasil.diagnosisNama} (keyakinan ${hasil.cfPersen}%).`);
  if (gagal.length === 0) {
    baris.push(`Kamu menjawab benar ${benar.length} dari ${hasil.buktiPlat.length} plat dan hampir tidak memilih gejala apa pun, sehingga tidak ada bukti buta warna.`);
  } else {
    baris.push(`Kamu gagal pada ${gagal.length} plat: ${gagal.map((b) => `plat ${b.nomor} (seharusnya ${b.jawabanBenar}, kamu jawab ${b.jawabanUser})`).join('; ')}.`);
    baris.push(`Warna yang tidak bisa dibedakan: ${warnaGagal.join(', ')}.`);
    baris.push(`Warna yang benar seharusnya: ${gagal.map((b) => `plat ${b.nomor} = ${b.warnaTarget} di atas ${b.warnaLatar}`).join('; ')}.`);
  }
  if (hasil.buktiGejala.length > 0) {
    baris.push(`Gejala yang kamu pilih (${hasil.buktiGejala.length}): ${hasil.buktiGejala.map((g) => g.teks).join('; ')}.`);
  }
  baris.push('Ini adalah hasil skrining awal, bukan diagnosis medis. Periksa ke dokter mata untuk kepastian.');
  return baris;
}

export function teksDokumenHasil({ nama, umur, tanggal, hasil }) {
  const garis = [];
  garis.push('HASIL KONSULTASI SISTEM PAKAR BUTA WARNA');
  garis.push(`Nama: ${nama || '-'} | Umur: ${umur || '-'} | Tanggal: ${tanggal}`);
  garis.push('');
  garis.push(`Diagnosis: ${hasil.diagnosisNama}`);
  garis.push(`Keyakinan (CF): ${hasil.cfPersen}%`);
  garis.push(`Kelompok: ${hasil.kelompok} | Label: ${hasil.labelParsial}`);
  garis.push('');
  garis.push('KENAPA HASIL INI?');
  bangunPenjelasan(hasil).forEach((b) => garis.push(`- ${b}`));
  garis.push('');
  garis.push('BUKTI PER PLAT');
  jelaskanPerPlat(hasil.buktiPlat).forEach((b) => garis.push(`Plat ${b.nomor} (${b.kategori}): jawab "${b.jawabanUser}", benar "${b.jawabanBenar}", ${b.pasanganWarnaTertukar}. ${b.penjelasan}`));
  garis.push('');
  garis.push('Disclaimer: skrining awal, bukan diagnosis medis.');
  return garis.join('\n');
}
