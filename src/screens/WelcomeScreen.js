import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

// Layar awal 2 tahap sesuai mockup:
// Tahap 0: "Apakah anda buta warna?" + "Click anywhere to continue"
//          (seluruh layar bisa diketuk untuk lanjut).
// Tahap 1: "Ayo tes bersama!" + tombol Start + karakter pinwheel (GIF).
// Semua konten rata tengah di dalam container selebar HP (maxWidth 480)
// yang terpusat di layar, supaya di web tidak menyebar ke tepi-tepi.
// Animasi simpel: konten nge-pop up (scale + fade) tiap tahap muncul,
// bintang-bintang di sekitarnya melayang naik-turun sambil berputar pelan.

function BintangMelayang({ style, ukuran = 40, delay = 0, durasi = 1800 }) {
  const nilai = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animasi = Animated.loop(
      Animated.sequence([
        Animated.timing(nilai, { toValue: 1, duration: durasi, delay, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(nilai, { toValue: 0, duration: durasi, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    animasi.start();
    return () => animasi.stop();
  }, [nilai, delay, durasi]);
  const geserY = nilai.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const putar = nilai.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '10deg'] });
  const redup = nilai.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  return (
    <Animated.Image
      source={require('../../assets/star.png')}
      resizeMode="contain"
      style={[
        styles.bintang,
        style,
        { width: ukuran, height: ukuran * 1.7, opacity: redup, transform: [{ translateY: geserY }, { rotate: putar }] },
      ]}
    />
  );
}

export default function WelcomeScreen({ go }) {
  const [tahap, setTahap] = useState(0);
  const pop = useRef(new Animated.Value(0)).current;
  const denyut = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 80, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [tahap, pop]);

  useEffect(() => {
    const animasi = Animated.loop(
      Animated.sequence([
        Animated.timing(denyut, { toValue: 1, duration: 900, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(denyut, { toValue: 0, duration: 900, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    animasi.start();
    return () => animasi.stop();
  }, [denyut]);

  const skalaPop = pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const gayaPop = { opacity: pop, transform: [{ scale: skalaPop }] };
  const redupLanjut = denyut.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  if (tahap === 0) {
    return (
      <Pressable style={styles.layar} onPress={() => setTahap(1)} accessibilityLabel="Ketuk untuk lanjut">
        <View style={styles.container}>
          <BintangMelayang style={{ left: 26, top: 190 }} ukuran={48} delay={0} durasi={1700} />
          <BintangMelayang style={{ right: 34, top: 150 }} ukuran={34} delay={450} durasi={2100} />
          <BintangMelayang style={{ left: 54, bottom: 210 }} ukuran={28} delay={800} durasi={1900} />
          <BintangMelayang style={{ right: 52, bottom: 250 }} ukuran={26} delay={300} durasi={2300} />
          <Animated.View style={[styles.kontenTengah, gayaPop]}>
            <Image source={require('../../assets/character-welcome.png')} style={styles.karakterAwal} resizeMode="contain" />
            <Text style={styles.judul}>Apakah anda buta warna?</Text>
            <Animated.Text style={[styles.lanjut, { opacity: redupLanjut }]}>Click anywhere to continue</Animated.Text>
          </Animated.View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.layar}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.tombolKembali} onPress={() => setTahap(0)}>
          <Text style={styles.tombolKembaliTeks}>← Kembali</Text>
        </TouchableOpacity>
        <BintangMelayang style={{ left: 28, top: 140 }} ukuran={40} delay={0} durasi={1800} />
        <BintangMelayang style={{ right: 32, top: 110 }} ukuran={30} delay={500} durasi={2200} />
        <BintangMelayang style={{ left: 50, bottom: 230 }} ukuran={26} delay={900} durasi={2000} />
        <BintangMelayang style={{ right: 48, bottom: 260 }} ukuran={24} delay={350} durasi={2400} />
        <Animated.View style={[styles.kontenTengah, gayaPop]}>
          {/* Animasi karakter: 132 frame dari animation.json digabung jadi satu WebP animasi
              (timing per frame persis sama). Diputar expo-image supaya jalan di HP dan web;
              pemutar frame per gambar di HP kalah cepat decode-nya sehingga tampil kosong. */}
          <ExpoImage source={require('../../assets/character-start.webp')} style={styles.karakterStart} contentFit="contain" autoplay />
          <Text style={styles.judul}>Ayo tes bersama!</Text>
          <TouchableOpacity style={styles.tombolStart} onPress={() => go('loading')}>
            <Text style={styles.tombolStartTeks}>Start</Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.bawah}>
          <View style={styles.tautanRow}>
            <TouchableOpacity onPress={() => go('home')}><Text style={styles.tautan}>Pelajari dulu</Text></TouchableOpacity>
            <Text style={styles.pemisah}>•</Text>
            <TouchableOpacity onPress={() => go('history')}><Text style={styles.tautan}>Riwayat</Text></TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>Skrining awal, bukan diagnosis medis.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },
  container: { flex: 1, width: '100%', maxWidth: 480, position: 'relative' },
  bintang: { position: 'absolute' },
  kontenTengah: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  karakterAwal: { width: 240, height: 189, marginBottom: 20 },
  karakterStart: { width: 260, height: 243, marginBottom: 16 },
  judul: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#111' },
  lanjut: { fontSize: 15, color: '#555', textAlign: 'center', marginTop: 10 },
  tombolKembali: { position: 'absolute', top: 12, left: 12, zIndex: 2, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#eef2ff' },
  tombolKembaliTeks: { color: '#1a73e8', fontWeight: 'bold', fontSize: 14 },
  tombolStart: {
    marginTop: 20, alignSelf: 'center', width: 200, paddingVertical: 16, borderRadius: 999,
    backgroundColor: '#e63946', alignItems: 'center',
    shadowColor: '#e63946', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  tombolStartTeks: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  bawah: { position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' },
  tautanRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tautan: { color: '#1a73e8', fontSize: 14 },
  pemisah: { color: '#999' },
  disclaimer: { fontSize: 12, color: '#888', marginTop: 8, textAlign: 'center' },
});
