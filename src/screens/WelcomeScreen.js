import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform, useWindowDimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

// Layar awal 2 tahap sesuai mockup panggung:
// Tahap 0: frame karakter kaget + "Apakah kamu buta warna??" +
//          "Click anywhere to continue" (seluruh layar bisa diketuk).
// Tahap 1: frame karakter mempersilakan + "Mari kita tes!!!" — masuk ke
//          tes dengan mengetuk gambar chibi penunjuk di sebelah teksnya.
// Komposisi mockup (rasio 4:3) dipertahankan di semua ukuran layar:
// panggung diskalakan memenuhi layar tanpa memotong karakter/teks.
// Semua stiker dan bintang melayang naik-turun pelan.

const SERIF = Platform.OS === 'web' ? 'Georgia, "Times New Roman", serif' : 'serif';
const MERAH_TEKS = '#b03a2e';

function Melayang({ style, delay = 0, durasi = 2000, jarak = 10, children }) {
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
  const geserY = nilai.interpolate({ inputRange: [0, 1], outputRange: [0, -jarak] });
  return <Animated.View style={[style, { transform: [{ translateY: geserY }] }]}>{children}</Animated.View>;
}

function Bintang({ style, ukuran, delay = 0, durasi = 1800 }) {
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
      style={[style, { width: ukuran, height: ukuran * 1.7, opacity: redup, transform: [{ translateY: geserY }, { rotate: putar }] }]}
    />
  );
}

export default function WelcomeScreen({ go }) {
  const [tahap, setTahap] = useState(0);
  const { width, height } = useWindowDimensions();
  const pop = useRef(new Animated.Value(0)).current;
  const denyut = useRef(new Animated.Value(0)).current;

  // Layar lebar (web desktop): panggung memenuhi layar.
  // Layar sempit/HP: panggung rasio 4:3 pas di tengah tanpa terpotong.
  const layarLebar = width >= 900 && width > height;
  const lebarPanggung = layarLebar ? width : Math.min(width, (height * 4) / 3);
  const tinggiPanggung = layarLebar ? height : (lebarPanggung * 3) / 4;
  const skala = Math.min(lebarPanggung / 1440, tinggiPanggung / 1024); // mockup 1440x1024

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

  const skalaPop = pop.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });
  const gayaPop = { opacity: pop, transform: [{ scale: skalaPop }] };
  const redupLanjut = denyut.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  const ukuranJudul = Math.max(16, 64 * skala);
  const ukuranLanjut = Math.max(11, 26 * skala);

  if (tahap === 0) {
    return (
      <Pressable style={styles.layar} onPress={() => setTahap(1)} accessibilityLabel="Ketuk untuk lanjut">
        <Animated.View style={[styles.panggung, { width: lebarPanggung, height: tinggiPanggung }, gayaPop]}>
          <ExpoImage source={require('../../assets/welcome-stage-awal.png')} style={styles.frame} contentFit="cover" />
          <Melayang style={[styles.stiker, { left: '23%', top: layarLebar ? '15%' : '11%', width: '19%' }]} delay={0} durasi={2100}>
            <ExpoImage source={require('../../assets/chibi-tanya.webp')} style={styles.stikerGambar} contentFit="contain" />
          </Melayang>
          <Melayang style={[styles.stiker, { right: '4%', bottom: '7%', width: '17%' }]} delay={600} durasi={2400}>
            <ExpoImage source={require('../../assets/chibi-kotak.png')} style={styles.stikerGambar} contentFit="contain" />
          </Melayang>
          <Bintang style={{ position: 'absolute', left: '41%', bottom: '22%' }} ukuran={Math.max(18, 70 * skala)} delay={300} durasi={1900} />
          <Bintang style={{ position: 'absolute', right: '11%', top: '40%' }} ukuran={Math.max(16, 60 * skala)} delay={800} durasi={2200} />
          <View style={[styles.blokTeks, { left: '38%', right: '3%', top: '47%' }]}>
            <Text style={[styles.judul, { fontSize: ukuranJudul }]}>Apakah kamu buta warna??</Text>
            <Animated.Text style={[styles.lanjut, { fontSize: ukuranLanjut, opacity: redupLanjut }]}>Click anywhere to continue</Animated.Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View style={styles.layar}>
      <Animated.View style={[styles.panggung, { width: lebarPanggung, height: tinggiPanggung }, gayaPop]}>
        <ExpoImage source={require('../../assets/welcome-stage-tes.png')} style={styles.frame} contentFit="cover" />
        <Pressable style={styles.tombolKembali} onPress={() => setTahap(0)} accessibilityLabel="Kembali">
          <Text style={[styles.tombolKembaliTeks, { fontSize: Math.max(11, 22 * skala) }]}>← Kembali</Text>
        </Pressable>
        <Bintang style={{ position: 'absolute', left: '50%', top: '38%' }} ukuran={Math.max(20, 80 * skala)} delay={0} durasi={1800} />
        <Bintang style={{ position: 'absolute', right: '13%', bottom: '24%' }} ukuran={Math.max(16, 60 * skala)} delay={500} durasi={2100} />
        <View style={[styles.blokTeks, { left: '40%', right: '24%', top: '50%' }]}>
          <Text style={[styles.judul, { fontSize: ukuranJudul }]}>Mari kita tes!!!</Text>
        </View>
        <Melayang style={[styles.stiker, { right: '5%', top: layarLebar ? '37%' : '40%', width: '18%' }]} delay={200} durasi={2000}>
          <Pressable style={styles.tombolGambar} onPress={() => go('loading')} accessibilityLabel="Mulai tes">
            <ExpoImage source={require('../../assets/chibi-tunjuk.webp')} style={styles.stikerGambar} contentFit="contain" />
          </Pressable>
        </Melayang>
        <Melayang style={[styles.stiker, { left: '40%', bottom: layarLebar ? '3%' : '1%', width: '17%' }]} delay={700} durasi={2300}>
          <ExpoImage source={require('../../assets/chibi-biru.webp')} style={styles.stikerGambar} contentFit="contain" />
        </Melayang>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  panggung: { position: 'relative', backgroundColor: '#fff', overflow: 'hidden' },
  frame: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  stiker: { position: 'absolute', aspectRatio: 1 },
  stikerGambar: { width: '100%', height: '100%' },
  tombolGambar: { width: '100%', height: '100%' },
  blokTeks: { position: 'absolute', alignItems: 'center' },
  judul: { fontFamily: SERIF, color: MERAH_TEKS, textAlign: 'center' },
  lanjut: { fontFamily: SERIF, color: '#111', textAlign: 'center', marginTop: 10 },
  tombolKembali: { position: 'absolute', top: '2%', right: '2%', zIndex: 2, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.85)' },
  tombolKembaliTeks: { color: '#1a73e8', fontWeight: 'bold' },
});
