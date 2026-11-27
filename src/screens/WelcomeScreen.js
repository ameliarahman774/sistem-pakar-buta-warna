import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform, useWindowDimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

// Layar awal 2 tahap mengikuti mockup Lilin persis proporsinya:
// komposisi digambar di kanvas desain (landscape 1440x1024, portrait
// 414x736) lalu diskalakan utuh mengikuti layar, jadi karakter, teks,
// dan stiker tidak melar atau kegedean di HP maupun laptop.
// Tahap 0: "Apakah kamu buta warna??" + "Click anywhere to continue"
//          (seluruh layar bisa diketuk).
// Tahap 1: "Mari kita tes!!!" — masuk ke tes dengan mengetuk gambar
//          chibi penunjuk di sebelah teksnya.
// Semua stiker dan bintang melayang naik-turun pelan.

const SERIF = Platform.OS === 'web' ? 'Georgia, "Times New Roman", serif' : 'serif';
const MERAH_TEKS = '#b03a2e';

function Melayang({ style, delay = 0, durasi = 2000, jarak = 8, children }) {
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
  const geserY = nilai.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
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
  const kanvasW = portrait ? 414 : 1440;
  const kanvasH = portrait ? 736 : 1024;
  const s = Math.min(width / kanvasW, height / kanvasH);
  const lebarKanvas = kanvasW * s;
  const tinggiKanvas = kanvasH * s;

  const ukuranJudul = (portrait ? 34 : 64) * s;
  const ukuranLanjut = (portrait ? 15 : 26) * s;

  useEffect(() => {
    pop.setValue(0);
    Animated.timing(pop, { toValue: 1, duration: 350, useNativeDriver: Platform.OS !== 'web' }).start();
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

  const redupLanjut = denyut.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  // Frame: landscape memenuhi kanvas; portrait setinggi kanvas dan
  // digeser ke kiri supaya wajah karakter di tepi kiri seperti mockup.
  const gayaFrame = portrait
    ? { position: 'absolute', left: -100 * s, top: 0, width: (tinggiKanvas * 4) / 3, height: tinggiKanvas }
    : styles.frame;

  const kanvas = (isi) => (
    <Animated.View style={[styles.kanvas, { width: lebarKanvas, height: tinggiKanvas, opacity: pop }]}>{isi}</Animated.View>
  );

  if (tahap === 0) {
    return (
      <Pressable style={styles.layar} onPress={() => setTahap(1)} accessibilityLabel="Ketuk untuk lanjut">
        {kanvas(
          <>
            <ExpoImage source={require('../../assets/welcome-stage-awal.png')} style={gayaFrame} contentFit={portrait ? 'cover' : 'fill'} />
            <Melayang
              style={[styles.stiker, portrait ? { left: '28%', top: '12%', width: 92 * s } : { left: '24%', top: '13%', width: 230 * s }]}
              delay={0}
              durasi={2100}
            >
              <ExpoImage source={require('../../assets/chibi-tanya.webp')} style={styles.stikerGambar} contentFit="contain" />
            </Melayang>
            <Melayang
              style={[styles.stiker, portrait ? { right: '3%', bottom: '4%', width: 92 * s } : { right: '7%', bottom: '7%', width: 240 * s }]}
              delay={600}
              durasi={2400}
            >
              <ExpoImage source={require('../../assets/chibi-kotak.png')} style={styles.stikerGambar} contentFit="contain" />
            </Melayang>
            <Bintang
              style={{ position: 'absolute', ...(portrait ? { right: '6%', top: '17%' } : { right: '11%', top: '40%' }) }}
              ukuran={(portrait ? 42 : 60) * s}
              delay={800}
              durasi={2200}
            />
            <Bintang
              style={{ position: 'absolute', ...(portrait ? { left: '48%', top: '54%' } : { left: '41%', bottom: '22%' }) }}
              ukuran={(portrait ? 26 : 70) * s}
              delay={300}
              durasi={1900}
            />
            <View style={[styles.blokTeks, portrait ? { left: '51%', right: '3%', top: '29%', alignItems: 'flex-start' } : { left: '40%', right: '2%', top: '49%' }]}>
              <Text style={[styles.judul, { fontSize: ukuranJudul, textAlign: portrait ? 'left' : 'center' }]}>Apakah kamu buta warna??</Text>
              <Animated.Text
                style={[styles.lanjut, { fontSize: ukuranLanjut, opacity: redupLanjut, textAlign: portrait ? 'left' : 'center', marginTop: (portrait ? 26 : 10) * s }]}
              >
                Click anywhere to continue
              </Animated.Text>
            </View>
          </>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.layar}>
      {kanvas(
        <>
          <ExpoImage source={require('../../assets/welcome-stage-tes.png')} style={gayaFrame} contentFit={portrait ? 'cover' : 'fill'} />
          <Bintang
            style={{ position: 'absolute', ...(portrait ? { left: '45%', top: '40%' } : { left: '50%', top: '36%' }) }}
            ukuran={(portrait ? 34 : 80) * s}
            delay={0}
            durasi={1800}
          />
          <Bintang
            style={{ position: 'absolute', ...(portrait ? { right: '7%', top: '60%' } : { right: '18%', bottom: '26%' }) }}
            ukuran={(portrait ? 26 : 60) * s}
            delay={500}
            durasi={2100}
          />
          <View style={[styles.blokTeks, portrait ? { left: '50%', right: '4%', top: '41%', alignItems: 'flex-start' } : { left: '44%', right: '22%', top: '49%' }]}>
            <Text style={[styles.judul, { fontSize: ukuranJudul, textAlign: portrait ? 'left' : 'center' }]}>Mari kita tes!!!</Text>
          </View>
          <Melayang
            style={[styles.stiker, portrait ? { right: '5%', top: '46%', width: 95 * s } : { right: '7%', top: '44%', width: 190 * s }]}
            delay={200}
            durasi={2000}
          >
            <Pressable style={styles.tombolGambar} onPress={() => go('loading')} accessibilityLabel="Mulai tes">
              <ExpoImage source={require('../../assets/chibi-tunjuk.webp')} style={styles.stikerGambar} contentFit="contain" />
            </Pressable>
          </Melayang>
          <Melayang
            style={[styles.stiker, portrait ? { left: '57%', bottom: '6%', width: 95 * s } : { left: '41%', bottom: '4%', width: 170 * s }]}
            delay={700}
            durasi={2300}
          >
            <ExpoImage source={require('../../assets/chibi-biru.webp')} style={styles.stikerGambar} contentFit="contain" />
          </Melayang>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  kanvas: { position: 'relative', backgroundColor: '#fff', overflow: 'hidden' },
  frame: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  stiker: { position: 'absolute', aspectRatio: 1 },
  stikerGambar: { width: '100%', height: '100%' },
  tombolGambar: { width: '100%', height: '100%' },
  blokTeks: { position: 'absolute', alignItems: 'center' },
  judul: { fontFamily: SERIF, color: MERAH_TEKS },
  lanjut: { fontFamily: SERIF, color: '#111' },
});
