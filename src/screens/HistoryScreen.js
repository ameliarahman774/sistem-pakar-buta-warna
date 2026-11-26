import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { bacaRiwayat, bacaRiwayatDetail, hapusRiwayat } from '../db/database';
import { jelaskanPerPlat, bangunPenjelasan } from '../engine/explain';
import { unduhHasilPdf } from '../engine/pdfFile';

export default function HistoryScreen({ go, kembali }) {
  const [cari, setCari] = useState('');
  const [daftar, setDaftar] = useState([]);
  const [detail, setDetail] = useState(null);
  const muat = async (q = '') => setDaftar(await bacaRiwayat(q));
  useEffect(() => { muat(); }, []);
  const buka = async (id) => setDetail(await bacaRiwayatDetail(id));
  const hapus = (id) => Alert.alert('Hapus riwayat?', 'Riwayat ini akan dihapus.', [{ text: 'Batal' }, { text: 'Hapus', onPress: async () => { await hapusRiwayat(id); setDetail(null); muat(cari); } }]);
  const unduhPdf = async () => {
    try { await unduhHasilPdf({ nama: detail.nama, umur: detail.umur, tanggal: detail.tanggal, hasil: detail.hasil }); }
    catch (e) { Alert.alert('Gagal membuat PDF', String(e.message || e)); }
  };
  if (detail) {
    const h = detail.hasil;
    return (
      <ScrollView style={styles.wrap}>
        <Text style={styles.judul}>Detail Riwayat #{detail.id}</Text>
        <Text>{detail.nama} • Umur {detail.umur} • {new Date(detail.tanggal).toLocaleString('id-ID')}</Text>
        <Text style={styles.diag}>{h.diagnosisNama} — CF {Math.round(h.cf * 100)}%</Text>
        <Text style={styles.seksi}>Kenapa hasil ini?</Text>
        {bangunPenjelasan(h).map((b, i) => (<Text key={i} style={styles.item}>• {b}</Text>))}
        <Text style={styles.seksi}>Bukti per Plat</Text>
        {jelaskanPerPlat(h.buktiPlat).map((b) => (<Text key={b.platId} style={styles.item}>• Plat {b.nomor}: jawab "{b.jawabanUser}", benar "{b.jawabanBenar}" — {b.pasanganWarnaTertukar}. {b.penjelasan}</Text>))}
        <TouchableOpacity style={[styles.tombol, styles.tombolUnduh]} onPress={unduhPdf}><Text style={styles.tombolTeks}>⬇ Unduh PDF</Text></TouchableOpacity>
        <View style={styles.terimaKasih}>
          <ExpoImage source={require('../../assets/result-thanks.webp')} style={styles.gambarTerimaKasih} contentFit="contain" />
          <Text style={styles.teksTerimaKasih}>Terima kasih sudah mengikuti tes ini.</Text>
        </View>
        <TouchableOpacity style={styles.tombolHapus} onPress={() => hapus(detail.id)}><Text style={styles.tombolTeks}>Hapus Riwayat Ini</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setDetail(null)}><Text style={styles.kembali}>← Kembali ke daftar</Text></TouchableOpacity>
      </ScrollView>
    );
  }
  return (
    <ScrollView style={styles.wrap}>
      <Text style={styles.judul}>Riwayat Konsultasi</Text>
      <TextInput style={styles.input} value={cari} onChangeText={(v) => { setCari(v); muat(v); }} placeholder="Cari nama / diagnosis..." />
      {daftar.length === 0 && <Text>Belum ada riwayat. Lakukan konsultasi dulu, lalu simpan hasilnya.</Text>}
      {daftar.map((r) => (
        <TouchableOpacity key={r.id} style={styles.kartu} onPress={() => buka(r.id)}>
          <Text style={styles.kartuJudul}>{r.nama} — {r.diagnosis_nama}</Text>
          <Text>CF {Math.round(r.cf * 100)}% • {new Date(r.tanggal).toLocaleString('id-ID')}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => (kembali ? kembali() : go('welcome'))}><Text style={styles.kembali}>← Kembali</Text></TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#fff' },
  judul: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  kartu: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8 },
  kartuJudul: { fontWeight: 'bold' },
  diag: { fontWeight: 'bold', fontSize: 16, marginVertical: 8 },
  seksi: { fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  item: { marginBottom: 6, lineHeight: 20 },
  tombol: { padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  tombolUnduh: { backgroundColor: '#6a1b9a' },
  terimaKasih: { alignItems: 'center', marginTop: 16 },
  gambarTerimaKasih: { width: 160, height: 160 },
  teksTerimaKasih: { marginTop: 6, textAlign: 'center' },
  tombolHapus: { backgroundColor: '#c62828', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
  tombolTeks: { color: '#fff', fontWeight: 'bold' },
  kembali: { color: '#1a73e8', marginBottom: 24 },
});
