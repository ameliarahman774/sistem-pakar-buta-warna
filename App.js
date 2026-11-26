// Sistem Informasi Pakar Buta Warna — React Native (Expo)
// Navigasi state-based sederhana (tanpa react-navigation) supaya tidak ribet.
// Layar pertama adalah Welcome yang simpel. Semua layar lain punya tombol
// Kembali yang selalu terlihat di atas (penting di web, yang tidak punya
// tombol back fisik seperti di HP).
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/db/database';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ConsultScreen from './src/screens/ConsultScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const JUDUL_LAYAR = {
  welcome: '',
  loading: '',
  home: 'Tentang Tes Ini',
  consult: 'Konsultasi',
  result: 'Hasil Analisa',
  history: 'Riwayat',
};

export default function App() {
  const [tumpukan, setTumpukan] = useState(['welcome']);
  const layar = tumpukan[tumpukan.length - 1];
  const [konsultasi, setKonsultasi] = useState(null);
  const [dbSiap, setDbSiap] = useState(false);
  const [dbError, setDbError] = useState('');

  useEffect(() => {
    initDatabase().then(() => setDbSiap(true)).catch((e) => setDbError(String(e.message || e)));
  }, []);

  if (!dbSiap) {
    return (
      <View style={styles.tengah}>
        <Text style={styles.judul}>Sistem Pakar Buta Warna</Text>
        <Text>{dbError ? `Database gagal dimuat: ${dbError}` : 'Menyiapkan database...'}</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  const go = (l) => setTumpukan((prev) => (prev[prev.length - 1] === l ? prev : [...prev, l]));
  // Ganti layar teratas (dipakai layar loading supaya tombol Kembali dari tes
  // langsung kembali ke welcome, bukan ke loading lagi).
  const ganti = (l) => setTumpukan((prev) => [...prev.slice(0, -1), l]);
  const kembali = () => setTumpukan((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const keBeranda = () => setTumpukan(['welcome']);

  return (
    <View style={styles.root}>
      <StatusBar style="auto" />
      {layar !== 'welcome' && layar !== 'loading' && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.tombolKembali} onPress={kembali}>
            <Text style={styles.tombolKembaliTeks}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerJudul}>{JUDUL_LAYAR[layar]}</Text>
          <View style={styles.headerPenyeimbang} />
        </View>
      )}
      <View style={styles.isi}>
        {layar === 'welcome' && <WelcomeScreen go={go} />}
        {layar === 'loading' && <LoadingScreen ganti={ganti} />}
        {layar === 'home' && <HomeScreen go={go} />}
        {layar === 'consult' && <ConsultScreen go={go} kembali={kembali} onHasil={setKonsultasi} />}
        {layar === 'result' && <ResultScreen konsultasi={konsultasi} go={go} keBeranda={keBeranda} />}
        {layar === 'history' && <HistoryScreen go={go} kembali={kembali} />}
      </View>
      {layar !== 'welcome' && layar !== 'loading' && (
        <View style={styles.nav}>
          {[
            ['welcome', 'Beranda'], ['consult', 'Konsultasi'], ['result', 'Hasil'],
            ['history', 'Riwayat'],
          ].map(([id, label]) => (
            <TouchableOpacity
              key={id}
              style={[styles.navBtn, layar === id && styles.navAktif]}
              onPress={() => (id === 'welcome' ? keBeranda() : go(id))}
            >
              <Text style={styles.navTeks}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  isi: { flex: 1 },
  tengah: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  judul: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  tombolKembali: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#eef2ff' },
  tombolKembaliTeks: { color: '#1a73e8', fontWeight: 'bold', fontSize: 14 },
  headerJudul: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  headerPenyeimbang: { width: 92 },
  nav: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderColor: '#ddd', padding: 6, gap: 4, backgroundColor: '#fafafa' },
  navBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16, backgroundColor: '#eee' },
  navAktif: { backgroundColor: '#1a73e8' },
  navTeks: { fontSize: 12 },
});
