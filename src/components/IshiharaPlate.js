// Komponen plat Ishihara SIMULASI prosedural.
// Menggambar angka dengan pola titik-titik berwarna memakai View biasa.
// Jujur: ini simulasi skrining, BUKAN plat Ishihara klinis asli —
// warna di layar HP berbeda-beda dan tidak menggantikan tes klinis.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Pola titik sederhana per digit (5 baris x 3 kolom, 1 = titik angka).
const POLA_DIGIT = {
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111'],
};

export default function IshiharaPlate({ plat, ukuran = 220 }) {
  const angka = String(plat.angkaBenar);
  const sel = Math.floor(ukuran / 6);
  const titik = [];
  let kunci = 0;
  angka.split('').forEach((digit) => {
    const pola = POLA_DIGIT[digit] || POLA_DIGIT['8'];
    pola.forEach((baris) => {
      baris.split('').forEach((c) => {
        titik.push({ kunci: kunci++, angka: c === '1' });
      });
    });
  });
  // Grid: tiap digit 3 kolom x 5 baris; tampilkan per digit berdampingan.
  const perDigit = 15;
  return (
    <View style={[styles.lingkaran, { width: ukuran, height: ukuran, backgroundColor: plat.warnaTitikLatar + '33', borderColor: plat.warnaTitikLatar }]}>
      <View style={styles.grid}>
        {angka.split('').map((digit, di) => (
          <View key={di} style={styles.digit}>
            {(POLA_DIGIT[digit] || POLA_DIGIT['8']).map((baris, bi) => (
              <View key={bi} style={styles.baris}>
                {baris.split('').map((c, ci) => (
                  <View key={ci} style={[styles.titik, { width: sel * 0.55, height: sel * 0.55, borderRadius: sel * 0.3, backgroundColor: c === '1' ? plat.warnaAngka : plat.warnaTitikLatar, opacity: c === '1' ? 1 : 0.55 }]} />
                ))}
              </View>
            ))}
          </View>
        ))}
      </View>
      <Text style={styles.keterangan}>Plat {plat.nomor} • simulasi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lingkaran: { borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', padding: 12 },
  grid: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  digit: { gap: 2 },
  baris: { flexDirection: 'row', gap: 2 },
  titik: {},
  keterangan: { marginTop: 8, fontSize: 11, color: '#666' },
});
