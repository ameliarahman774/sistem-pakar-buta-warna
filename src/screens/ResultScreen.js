import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { jelaskanPerPlat, bangunPenjelasan } from '../engine/explain';
import { unduhHasilPdf } from '../engine/pdfFile';
import { simpanRiwayat } from '../db/database';

export default function ResultScreen({ konsultasi, go, keBeranda }) {
  if (!konsultasi) return (<View style={styles.wrap}><Text>Belum ada hasil. Mulai konsultasi dulu.</Text><TouchableOpacity style={styles.tombol} onPress={() => go('consult')}><Text style={styles.tombolTeks}>Mulai Konsultasi</Text></TouchableOpacity></View>);
  const { hasil, nama, umur, tanggal } = konsultasi;
  const bukti = jelaskanPerPlat(hasil.buktiPlat);
  const simpan = async () => {
    try { await simpanRiwayat({ nama, umur, tanggal, hasil, gejalaTerpilih: konsultasi.gejalaTerpilih, jawabanPlat: konsultasi.jawabanPlat }); Alert.alert('Tersimpan', 'Hasil tersimpan ke Riwayat.'); }
    catch (e) { Alert.alert('Gagal menyimpan', String(e.message || e)); }
  };
  const unduhPdf = async () => {
    try { await unduhHasilPdf({ nama, umur, tanggal, hasil }); }
    catch (e) { Alert.alert('Gagal membuat PDF', String(e.message || e)); }
  };
  return (
    <ScrollView style={styles.wrap}>
      <Text style={styles.judul}>Hasil Analisa</Text>
      <Text>{nama} • Umur {umur || '-'} • {new Date(tanggal).toLocaleString('id-ID')}</Text>
      <View style={styles.kartuHasil}><Text style={styles.diagnosis}>{hasil.diagnosisNama}</Text><Text>Label: {hasil.labelParsial} • Kelompok: {hasil.kelompok}</Text><Text style={styles.cf}>Keyakinan (CF): {hasil.cfPersen}%</Text></View>

      <Text style={styles.seksi}>Kenapa hasil ini?</Text>
      {bangunPenjelasan(hasil).map((b, i) => (<Text key={i} style={styles.item}>• {b}</Text>))}

      <Text style={styles.seksi}>Hipotesis lain</Text>
      {hasil.hipotesis.slice(1).map((h) => (<Text key={h.id} style={styles.item}>• {h.nama} — {Math.round(h.cf * 100)}%</Text>))}
      {hasil.hipotesis.length <= 1 && <Text style={styles.item}>Tidak ada hipotesis lain yang terpicu.</Text>}

      <Text style={styles.seksi}>Bukti per Plat — jawaban kamu vs jawaban benar</Text>
      {bukti.map((b) => (
        <View key={b.platId} style={styles.kartu}>
          <Text style={styles.kartuJudul}>Plat {b.nomor} ({b.kategori}) — {b.benar ? '✅ Benar' : b.ragu ? '❓ Ragu' : '❌ Salah / tidak terlihat'}</Text>
          <Text>Jawaban kamu: {b.jawabanUser} • Jawaban benar: {b.jawabanBenar}</Text>
          <Text>Warna target: {b.warnaTarget} • Warna latar: {b.warnaLatar}</Text>
          <Text>Warna yang tertukar: {b.pasanganWarnaTertukar}</Text>
          <Text>{b.penjelasan}</Text>
        </View>
      ))}

      <Text style={styles.seksi}>Bukti Gejala</Text>
      {hasil.buktiGejala.length === 0 ? <Text style={styles.item}>Tidak ada gejala yang dipilih.</Text> : hasil.buktiGejala.map((g) => (<Text key={g.id} style={styles.item}>• {g.id} — {g.teks}</Text>))}

      <Text style={styles.seksi}>Warna yang benar seharusnya</Text>
      {bukti.filter((b) => b.gagal).map((b) => (<Text key={b.platId} style={styles.item}>• Plat {b.nomor}: seharusnya {b.warnaTarget} di atas {b.warnaLatar} (angka {b.jawabanBenar}), bukan {b.pasanganWarnaTertukar} yang tampak sama.</Text>))}
      {bukti.filter((b) => b.gagal).length === 0 && <Text style={styles.item}>Semua plat dijawab benar — tidak ada warna yang gagal dibedakan.</Text>}

      <Text style={styles.seksi}>Saran tindak lanjut</Text>
      <Text style={styles.item}>{hasil.hipotesis[0]?.saran || 'Periksa ke dokter mata untuk konfirmasi.'}</Text>
      <Text style={styles.disclaimer}>Disclaimer: ini skrining awal, bukan diagnosis medis. Periksa ke dokter mata / tes lanjutan (anomaloskop, Farnsworth D-15) untuk kepastian.</Text>

      <TouchableOpacity style={styles.tombol} onPress={simpan}><Text style={styles.tombolTeks}>Simpan ke Riwayat</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.tombol, styles.tombol3]} onPress={unduhPdf}><Text style={styles.tombolTeks}>⬇ Unduh PDF</Text></TouchableOpacity>
      <View style={styles.terimaKasih}>
        <ExpoImage source={require('../../assets/result-thanks.webp')} style={styles.gambarTerimaKasih} contentFit="contain" />
        <Text style={styles.teksTerimaKasih}>Terima kasih sudah mengikuti tes ini.</Text>
      </View>
      <TouchableOpacity onPress={() => (keBeranda ? keBeranda() : go('welcome'))}><Text style={styles.kembali}>← Beranda</Text></TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#fff' },
  judul: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  kartuHasil: { backgroundColor: '#e8f5e9', padding: 14, borderRadius: 10, marginVertical: 10 },
  diagnosis: { fontSize: 18, fontWeight: 'bold' },
  cf: { fontWeight: 'bold', marginTop: 4 },
  seksi: { fontWeight: 'bold', marginTop: 14, marginBottom: 6, fontSize: 15 },
  item: { marginBottom: 6, lineHeight: 20 },
  kartu: { backgroundColor: '#f7f7f7', padding: 10, borderRadius: 8, marginBottom: 8 },
  kartuJudul: { fontWeight: 'bold', marginBottom: 4 },
  disclaimer: { fontSize: 12, color: '#777', marginTop: 10 },
  tombol: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 8 },
  tombol2: { backgroundColor: '#2e7d32' },
  tombol3: { backgroundColor: '#6a1b9a' },
  terimaKasih: { alignItems: 'center', marginTop: 16, marginBottom: 8 },
  gambarTerimaKasih: { width: 170, height: 170 },
  teksTerimaKasih: { fontSize: 15, fontWeight: 'bold', color: '#111', marginTop: 8, textAlign: 'center' },
  tombolTeks: { color: '#fff', fontWeight: 'bold' },
  kembali: { color: '#1a73e8', marginBottom: 24 },
});
