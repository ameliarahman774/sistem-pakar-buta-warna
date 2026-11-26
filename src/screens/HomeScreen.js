import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { JENIS_BUTA_WARNA } from '../data/knowledgeBase';
import { statistikRiwayat } from '../db/database';

export default function HomeScreen({ go }) {
  const [stat, setStat] = useState({ total: 0, perDiagnosis: [] });
  useEffect(() => { statistikRiwayat().then(setStat).catch(() => {}); }, []);
  const kelompok = [
    { nama: 'Merah-Hijau (paling umum)', isi: 'Protanopia, Protanomaly, Deuteranopia, Deuteranomaly — sulit bedakan merah dan hijau.' },
    { nama: 'Biru-Kuning (langka)', isi: 'Tritanopia dan Tritanomaly — sulit bedakan biru dan kuning.' },
    { nama: 'Total', isi: 'Achromatopsia — tidak melihat warna sama sekali, hanya hitam-putih-abu-abu.' },
    { nama: 'Normal', isi: 'Mampu membedakan semua warna dengan baik.' },
  ];
  return (
    <ScrollView style={styles.wrap}>
      <Text style={styles.judul}>Sistem Pakar Buta Warna</Text>
      <Text style={styles.sub}>Analisa apakah seseorang buta warna, jenisnya apa, dan kenapa — dengan forward chaining dan bukti per plat.</Text>
      <View style={styles.kartu}><Text style={styles.kartuJudul}>Riwayat Konsultasi</Text><Text>Total konsultasi tersimpan: {stat.total}</Text></View>
      {kelompok.map((k) => (<View key={k.nama} style={styles.kartu}><Text style={styles.kartuJudul}>{k.nama}</Text><Text>{k.isi}</Text></View>))}
      <Text style={styles.seksi}>Jenis hasil yang dikenali</Text>
      {JENIS_BUTA_WARNA.map((j) => (<Text key={j.id} style={styles.item}>• {j.nama} — {j.labelParsial}</Text>))}
      <TouchableOpacity style={styles.tombol} onPress={() => go('consult')}><Text style={styles.tombolTeks}>Mulai Konsultasi</Text></TouchableOpacity>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => go('history')}><Text>Riwayat</Text></TouchableOpacity>
      </View>
      <Text style={styles.disclaimer}>Skrining awal, bukan diagnosis medis. Hasil perlu dikonfirmasi dokter mata.</Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#fff' },
  judul: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  sub: { fontSize: 14, color: '#444', marginBottom: 12 },
  kartu: { backgroundColor: '#f2f6ff', padding: 12, borderRadius: 10, marginBottom: 10 },
  kartuJudul: { fontWeight: 'bold', marginBottom: 4 },
  seksi: { fontWeight: 'bold', marginTop: 8, marginBottom: 6 },
  item: { marginBottom: 4 },
  tombol: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 12 },
  tombolTeks: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  menu: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  menuBtn: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, alignItems: 'center' },
  disclaimer: { fontSize: 12, color: '#777', marginBottom: 24 },
});
