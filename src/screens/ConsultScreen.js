import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Animated, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { GEJALA, JENIS_BUTA_WARNA } from '../data/knowledgeBase';
import { ISHIHARA_PLATES } from '../data/ishiharaPlates';
import IshiharaPlate from '../components/IshiharaPlate';
import { forwardChaining } from '../engine/forwardChaining';
import { muatAturanUntukInferensi, muatGejalaUntukInferensi, muatJenisUntukInferensi, muatPlatUntukInferensi } from '../db/database';

// Konsultasi awal dibuat singkat dan adaptif: cukup jawab 4 pertanyaan inti.
// Detail gejala hanya muncul untuk kelompok yang dipilih, jadi pengguna
// normal bisa langsung lanjut tanpa membaca 24 item. Basis pengetahuan
// tetap 24 gejala (premis tidak berkurang).
const KELOMPOK_KONSULTASI = [
  {
    id: 'merah-hijau',
    pertanyaan: 'Pernah sulit membedakan merah, hijau, coklat, atau oranye?',
    gejalaIds: ['G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07', 'G08', 'G09', 'G10', 'G22', 'G23'],
  },
  {
    id: 'biru-kuning',
    pertanyaan: 'Pernah sulit membedakan biru, kuning, atau ungu?',
    gejalaIds: ['G11', 'G12', 'G13', 'G14', 'G15'],
  },
  {
    id: 'umum-warna',
    pertanyaan: 'Warna terlihat pudar, hanya hitam-putih-abu, atau sulit membedakan gelap-terang?',
    gejalaIds: ['G16', 'G17', 'G18'],
  },
  {
    id: 'aktivitas-riwayat',
    pertanyaan: 'Ada kesulitan aktivitas warna atau riwayat keluarga buta warna?',
    gejalaIds: ['G19', 'G20', 'G21', 'G24'],
  },
];

// Tes memakai 15 plat pilihan yang seimbang antar kategori
// (basis pengetahuan tetap 24 plat; ambang rules menyesuaikan jumlah plat).
const PLAT_TES_IDS = ['P01', 'P02', 'P04', 'P06', 'P08', 'P10', 'P11', 'P13', 'P15', 'P17', 'P19', 'P20', 'P22', 'P23', 'P24'];

function pilihPlatTes(semuaPlat) {
  const terpilih = PLAT_TES_IDS
    .map((id) => semuaPlat.find((p) => p.id === id))
    .filter(Boolean)
    .map((p, i) => ({ ...p, nomor: i + 1 }));
  return terpilih.length >= 10 ? terpilih : semuaPlat.slice(0, 15).map((p, i) => ({ ...p, nomor: i + 1 }));
}

export default function ConsultScreen({ go, kembali, onHasil }) {
  const [nama, setNama] = useState('');
  const [umur, setUmur] = useState('');
  const [gejala, setGejala] = useState([]);
  const [kelompokTerbuka, setKelompokTerbuka] = useState([]);
  const [jawaban, setJawaban] = useState({});
  const [tahap, setTahap] = useState(0); // 0 konsultasi awal, 1 tes plat
  const [gejalaDb, setGejalaDb] = useState(GEJALA);
  const [platDb, setPlatDb] = useState(ISHIHARA_PLATES);
  const [jenisDb, setJenisDb] = useState(JENIS_BUTA_WARNA);
  useEffect(() => {
    muatGejalaUntukInferensi().then(setGejalaDb).catch(() => {});
    muatPlatUntukInferensi().then(setPlatDb).catch(() => {});
    muatJenisUntukInferensi().then(setJenisDb).catch(() => {});
  }, []);

  const platTes = pilihPlatTes(platDb);

  // Efek mengambang halus untuk penanda sesi tes.
  const melayang = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animasi = Animated.loop(
      Animated.sequence([
        Animated.timing(melayang, { toValue: 1, duration: 1600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(melayang, { toValue: 0, duration: 1600, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    animasi.start();
    return () => animasi.stop();
  }, [melayang]);
  const geserMelayang = melayang.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  const toggleGejala = (id) => setGejala((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleKelompok = (kelompok) => {
    if (kelompokTerbuka.includes(kelompok.id)) {
      setKelompokTerbuka((s) => s.filter((x) => x !== kelompok.id));
      setGejala((s) => s.filter((id) => !kelompok.gejalaIds.includes(id)));
    } else {
      setKelompokTerbuka((s) => [...s, kelompok.id]);
    }
  };
  const setJawab = (id, v) => setJawaban((j) => ({ ...j, [id]: v }));

  const proses = async () => {
    if (!nama.trim()) { Alert.alert('Isi nama dulu'); return; }
    const [aturan, plates, jenis] = await Promise.all([
      muatAturanUntukInferensi(),
      muatPlatUntukInferensi(),
      muatJenisUntukInferensi(),
    ]);
    setPlatDb(plates);
    setJenisDb(jenis);
    const hasil = forwardChaining({ gejalaTerpilih: gejala, jawabanPlat: jawaban, aturan, gejala: gejalaDb, plates: pilihPlatTes(plates), jenis });
    onHasil({ nama, umur, tanggal: new Date().toISOString(), hasil, gejalaTerpilih: gejala, jawabanPlat: jawaban });
    go('result');
  };

  if (tahap === 0) {
    return (
      <ScrollView style={styles.wrap}>
        <View style={styles.penandaSesi}>
          <ExpoImage source={require('../../assets/consultation-marker.webp')} style={styles.gambarPenanda} contentFit="contain" />
          <View>
            <Text style={styles.judulPenanda}>Konsultasi</Text>
            <Text style={styles.subPenanda}>Sesi konsultasi awal</Text>
          </View>
        </View>
        <Text style={styles.sub}>Jawab singkat saja. Pilih hal yang pernah kamu alami saat membedakan warna. Kalau tidak ada, langsung lanjut ke tes.</Text>
        <Text style={styles.label}>Nama</Text>
        <TextInput style={styles.input} value={nama} onChangeText={setNama} placeholder="Nama lengkap" />
        <Text style={styles.label}>Umur</Text>
        <TextInput style={styles.input} value={umur} onChangeText={setUmur} placeholder="Umur" keyboardType="numeric" />
        <Text style={styles.label}>Pernah mengalami kesulitan berikut?</Text>
        {KELOMPOK_KONSULTASI.map((kelompok) => {
          const terbuka = kelompokTerbuka.includes(kelompok.id);
          return (
            <View key={kelompok.id}>
              <TouchableOpacity style={[styles.pilihan, terbuka && styles.pilihanAktif]} onPress={() => toggleKelompok(kelompok)}>
                <Text>{terbuka ? '☑ ' : '☐ '}{kelompok.pertanyaan}</Text>
              </TouchableOpacity>
              {terbuka && kelompok.gejalaIds.map((id) => {
                const g = gejalaDb.find((x) => x.id === id);
                if (!g) return null;
                return (
                  <TouchableOpacity key={g.id} style={[styles.pilihanDetail, gejala.includes(g.id) && styles.pilihanAktif]} onPress={() => toggleGejala(g.id)}>
                    <Text>{gejala.includes(g.id) ? '☑ ' : '☐ '}{g.teks}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
        <TouchableOpacity style={styles.tombol} onPress={() => setTahap(1)}><Text style={styles.tombolTeks}>Lanjut ke Tes Warna →</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => (kembali ? kembali() : go('welcome'))}><Text style={styles.kembali}>← Kembali</Text></TouchableOpacity>
      </ScrollView>
    );
  }
  return (
    <ScrollView style={styles.wrap}>
      <View style={styles.penandaSesi}>
        <Animated.View style={{ transform: [{ translateY: geserMelayang }] }}>
          <ExpoImage source={require('../../assets/test-marker.webp')} style={styles.gambarPenanda} contentFit="contain" />
        </Animated.View>
        <View>
          <Text style={styles.judulPenanda}>Tes Warna</Text>
          <Text style={styles.subPenanda}>Sesi tes — {platTes.length} plat</Text>
        </View>
      </View>
      <Text style={styles.sub}>SIMULASI skrining, bukan plat klinis asli. Tulis angka yang kamu lihat, atau pilih "Tidak terlihat" / "Ragu".</Text>
      {platTes.map((p) => (
        <View key={p.id} style={styles.kartu}>
          <IshiharaPlate plat={p} />
          <Text style={styles.label}>Plat {p.nomor} dari {platTes.length} — angka yang terlihat?</Text>
          <TextInput style={styles.input} value={jawaban[p.id] || ''} onChangeText={(v) => setJawab(p.id, v)} placeholder="Contoh: 12" keyboardType="numeric" />
          <View style={styles.row}>
            <TouchableOpacity style={styles.mini} onPress={() => setJawab(p.id, 'tidak terlihat')}><Text>Tidak terlihat</Text></TouchableOpacity>
            <TouchableOpacity style={styles.mini} onPress={() => setJawab(p.id, 'ragu')}><Text>Ragu</Text></TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.tombol} onPress={proses}><Text style={styles.tombolTeks}>Lihat Hasil Analisa</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => setTahap(0)}><Text style={styles.kembali}>← Kembali ke konsultasi awal</Text></TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#fff' },
  penandaSesi: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  gambarPenanda: { width: 64, height: 64 },
  judulPenanda: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  subPenanda: { fontSize: 13, color: '#666', marginTop: 2 },
  judul: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  sub: { color: '#555', marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 6 },
  pilihan: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 6 },
  pilihanDetail: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 6, marginLeft: 16 },
  pilihanAktif: { backgroundColor: '#e3f0ff', borderColor: '#1a73e8' },
  tombol: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 12 },
  tombolTeks: { color: '#fff', fontWeight: 'bold' },
  kembali: { color: '#1a73e8', marginBottom: 24 },
  kartu: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  mini: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 8 },
});
