import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform, useWindowDimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

// Layar awal 2 tahap sesuai mockup panggung:
// Tahap 0: frame karakter kaget + "Apakah kamu buta warna??" +
//          "Click anywhere to continue" (seluruh layar bisa diketuk).
// Tahap 1: frame karakter mempersilakan + "Mari kita tes!!!" — masuk ke
//          tes dengan mengetuk gambar chibi penunjuk di sebelah teksnya.
// Background selalu memenuhi layar (zoom to fit): di layar lebar frame
// menutupi seluruh layar, di HP portrait frame diskalakan setinggi layar
// dan ditambatkan ke kiri supaya karakter tetap terlihat, teksnya
// menumpuk di sisi kanan seperti contoh portrait dari Lilin.
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

  const portrait = height > width;
  const skala = Math.min(width / 1440, height / 1024); // mockup 1440x1024
  const ukuranJudul = portrait ? Math.max(26, width * 0.085) : Math.max(16, 64 * skala);
  const ukuranLanjut = portrait ? Math.max(14, width * 0.04) : Math.max(11, 26 * skala);

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

  // Portrait: frame setinggi layar, lebar mengikuti rasio 4:3, digeser
  // sedikit ke kiri supaya wajah karakter di tepi kiri seperti mockup HP.
  // Landscape: frame memenuhi layar penuh (fill) tanpa gap putih.
  const gayaFrame = portrait
    ? { position: 'absolute', left: -width * 0.28, top: 0, width: (height * 4) / 3, height }
    : styles.frame;
  const isiFrame = portrait ? 'cover' : 'fill';

  if (tahap === 0) {
    return (
      <Pressable style={styles.layar} onPress={() => setTahap(1)} accessibilityLabel="Ketuk untuk lanjut">
        <Animated.View style={[styles.panggung, gayaPop]}>
          <ExpoImage source={require('../../assets/welcome-stage-awal.png')} style={gayaFrame} contentFit={isiFrame} />
          <Melayang
            style={[styles.stiker, portrait ? { left: '28%', top: '12%', width: '22%' } : { left: '24%', top: '13%', width: '16%' }]}
            delay={0}
            durasi={2100}
          >
            <ExpoImage source={require('../../assets/chibi-tanya.webp')} style={styles.stikerGambar} contentFit="contain" />
          </Melayang>
          <Melayang
            style={[styles.stiker, portrait ? { right: '3%', bottom: '4%', width: '22%' } : { right: '7%', bottom: '8%', width: '17%' }]}
            delay={600}
            durasi={2400}
          >
            <ExpoImage source={require('../../assets/chibi-kotak.png')} style={styles.stikerGambar} contentFit="contain" />
          </Melayang>
          <Bintang
            style={{ position: 'absolute', ...(portrait ? { right: '7%', top: '17%' } : { right: '11%', top: '40%' }) }}
            ukuran={portrait ? Math.max(26, width * 0.1) : Math.max(16, 60 * skala)}
            delay={800}
            durasi={2200}
          />
          <Bintang
            style={{ position: 'absolute', ...(portrait ? { left: '49%', top: '54%' } : { left: '41%', bottom: '22%' }) }}
            ukuran={portrait ? Math.max(18, width * 0.07) : Math.max(18, 70 * skala)}
            delay={300}
            durasi={1900}
          />
          <View style={[styles.blokTeks, portrait ? { left: '51%', right: '3%', top: '29%', alignItems: 'flex-start' } : { left: '40%', right: '2%', top: '49%' }]}>
            <Text style={[styles.judul, { fontSize: ukuranJudul, textAlign: portrait ? 'left' : 'center' }]}>Apakah kamu buta warna??</Text>
            <Animated.Text
              style={[styles.lanjut, { fontSize: ukuranLanjut, opacity: redupLanjut, textAlign: portrait ? 'left' : 'center', marginTop: portrait ? 28 : 10 }]}
            >
              Click anywhere to continue
            </Animated.Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View style={styles.layar}>
      <Animated.View style={[styles.panggung, gayaPop]}>
        <ExpoImage source={require('../../assets/welcome-stage-tes.png')} style={gayaFrame} contentFit={isiFrame} />
        <Pressable style={styles.tombolKembali} onPress={() => setTahap(0)} accessibilityLabel="Kembali">
          <Text style={[styles.tombolKembaliTeks, { fontSize: Math.max(11, 22 * skala) }]}>← Kembali</Text>
        </Pressable>
        <Bintang
          style={{ position: 'absolute', ...(portrait ? { left: '46%', top: '40%' } : { left: '50%', top: '36%' }) }}
          ukuran={portrait ? Math.max(24, width * 0.09) : Math.max(20, 80 * skala)}
          delay={0}
          durasi={1800}
        />
        <Bintang
          style={{ position: 'absolute', ...(portrait ? { right: '7%', top: '60%' } : { right: '18%', bottom: '26%' }) }}
          ukuran={portrait ? Math.max(18, width * 0.07) : Math.max(16, 60 * skala)}
          delay={500}
          durasi={2100}
        />
        <View style={[styles.blokTeks, portrait ? { left: '50%', right: '4%', top: '41%', alignItems: 'flex-start' } : { left: '44%', right: '22%', top: '49%' }]}>
          <Text style={[styles.judul, { fontSize: ukuranJudul, textAlign: portrait ? 'left' : 'center' }]}>Mari kita tes!!!</Text>
        </View>
        <Melayang
          style={[styles.stiker, portrait ? { right: '5%', top: '46%', width: '23%' } : { right: '7%', top: '42%', width: '14%' }]}
          delay={200}
          durasi={2000}
        >
          <Pressable style={styles.tombolGambar} onPress={() => go('loading')} accessibilityLabel="Mulai tes">
            <ExpoImage source={require('../../assets/chibi-tunjuk.webp')} style={styles.stikerGambar} contentFit="contain" />
          </Pressable>
        </Melayang>
        <Melayang
          style={[styles.stiker, portrait ? { left: '57%', bottom: '6%', width: '22%' } : { left: '41%', bottom: '5%', width: '13%' }]}
          delay={700}
          durasi={2300}
        >
          <ExpoImage source={require('../../assets/chibi-biru.webp')} style={styles.stikerGambar} contentFit="contain" />
        </Melayang>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: '#fff' },
  panggung: { flex: 1, position: 'relative', backgroundColor: '#fff', overflow: 'hidden' },
  frame: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  stiker: { position: 'absolute', aspectRatio: 1 },
  stikerGambar: { width: '100%', height: '100%' },
  tombolGambar: { width: '100%', height: '100%' },
  blokTeks: { position: 'absolute', alignItems: 'center' },
  judul: { fontFamily: SERIF, color: MERAH_TEKS },
  lanjut: { fontFamily: SERIF, color: '#111' },
  tombolKembali: { position: 'absolute', top: '2%', right: '2%', zIndex: 2, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.85)' },
  tombolKembaliTeks: { color: '#1a73e8', fontWeight: 'bold' },
});
