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

function Bintang({ style, lebar, tinggi, delay = 0, durasi = 1800, rotasi = 0 }) {
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
  const putar = nilai.interpolate({ inputRange: [0, 1], outputRange: [`${rotasi - 4}deg`, `${rotasi + 4}deg`] });
  const redup = nilai.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  return (
    <Animated.Image
      source={require('../../assets/star.png')}
      resizeMode="contain"
      style={[style, { width: lebar, height: tinggi, opacity: redup, transform: [{ translateY: geserY }, { rotate: putar }] }]}
    />
  );
}

export default function WelcomeScreen({ go }) {
  const [tahap, setTahap] = useState(0);
  const { width, height } = useWindowDimensions();
  const pop = useRef(new Animated.Value(0)).current;
  const denyut = useRef(new Animated.Value(0)).current;

  const portrait = height > width;
  // Portrait: kanvas mockup HP diskalakan utuh. Landscape (web desktop):
  // panggung memenuhi layar dan semua posisi mengikuti persentase
  // mockup Desktop 1440x1024, ukuran elemen diskalakan dari lebar layar.
  // Landscape memakai frame versi lebar (1920x960) yang memenuhi layar
  // tanpa gepeng dan tanpa ada bagian yang kepotong; ukuran elemen
  // diskalakan dari tinggi layar mengikuti mockup Desktop.
  const s = portrait ? height / 736 : height / 1024;
  const lebarKanvas = width;
  const tinggiKanvas = height;

  // Teks & bintang desktop diskalakan dari lebar layar supaya rentang
  // dan posisinya sama seperti mockup Desktop 1440x1024.
  const sx = width / 1440;
  const ukuranJudul = portrait ? 20 * s : 64 * sx;
  const ukuranLanjut = portrait ? 15 * s : 26 * sx;

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
    <Animated.View
      style={[
        styles.kanvas,
        { width: lebarKanvas, height: tinggiKanvas, left: (width - lebarKanvas) / 2, top: (height - tinggiKanvas) / 2, opacity: pop },
      ]}
    >
      {isi}
    </Animated.View>
  );

  if (tahap === 0) {
    return (
      <Pressable style={styles.layar} onPress={() => setTahap(1)} accessibilityLabel="Ketuk untuk lanjut">
        {kanvas(
          <>
            {portrait ? (
              <ExpoImage source={require('../../assets/karakter-awal.png')} style={{ position: 'absolute', left: '-45%', bottom: 0, height: '48%', aspectRatio: 2022 / 2151 }} contentFit="contain" />
            ) : (
              <ExpoImage source={require('../../assets/welcome-stage-awal-wide.png')} style={gayaFrame} contentFit="cover" />
            )}
            <Melayang
              style={[styles.stiker, portrait ? { left: '12%', top: '27%', width: 65 * s } : { left: '32%', top: '32%', width: 160 * sx }]}
              delay={0}
              durasi={2100}
            >
              <ExpoImage source={require('../../assets/chibi-tanya.webp')} style={[styles.stikerGambar, portrait ? null : { transform: [{ rotate: '-8deg' }] }]} contentFit="contain" />
            </Melayang>
            <Melayang
              style={[styles.stiker, portrait ? { left: '82%', top: '86%', width: 64 * s } : { left: '82%', top: '65%', width:190 * sx }]}
              delay={600}
              durasi={2400}
            >
              <ExpoImage source={require('../../assets/chibi-kotak.png')} style={styles.stikerGambar} contentFit="contain" />
            </Melayang>
            <Bintang
              style={{ position: 'absolute', ...(portrait ? { left: '84%', top: '22%' } : { left: '81.9%', top: '36%' }) }}
              lebar={portrait ? 42 * s : 86 * s}
              tinggi={portrait ? 79 * s : 144 * s}
              rotasi={0}
              delay={800}
              durasi={2200}
            />
            <Bintang
              style={{ position: 'absolute', ...(portrait ? { left: '12%', top: '42%' } : { left: '35%', top: '61%' }) }}
              lebar={portrait ? 24 * s : 74 * s}
              tinggi={portrait ? 32 * s : 150 * s}
              rotasi={portrait ? 35 : 50}
              delay={300}
              durasi={1900}
            />
            <View style={[styles.blokTeks, portrait ? { left: '4%', right: '4%', top: '36%' } : { left: '33%', right: '11%', top: '50.3%' }]}>
              <Text style={[styles.judul, { fontSize: ukuranJudul, textAlign: 'center' }]}>Apakah kamu buta warna??</Text>
              <Animated.Text
                style={[styles.lanjut, { fontSize: ukuranLanjut, opacity: redupLanjut, textAlign: 'center', marginTop: portrait ? 10 * s : 24 * s }]}
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
      <Pressable style={[styles.tombolKembali, portrait ? { top: 52 } : null]} onPress={() => setTahap(0)} accessibilityLabel="Kembali">
        <Text style={styles.tombolKembaliTeks}>← Kembali</Text>
      </Pressable>
      {kanvas(
        <>
          {portrait ? (
            <ExpoImage source={require('../../assets/karakter-tes.png')} style={{ position: 'absolute', left: '-48%', bottom: 0, height: '50%', aspectRatio: 2084 / 2279 }} contentFit="contain" />
          ) : (
            <ExpoImage source={require('../../assets/welcome-stage-tes-wide.png')} style={gayaFrame} contentFit="cover" />
          )}
          <Bintang
            style={{ position: 'absolute', ...(portrait ? { left: '6%', top: '32%' } : { left: '38%', top: '35.6%' }) }}
            lebar={portrait ? 30 * s : 170 * sx}
            tinggi={portrait ? 50 * s : 200 * s}
            rotasi={portrait ? 35 : 50}
            delay={0}
            durasi={1800}
          />
          <Bintang
            style={{ position: 'absolute', ...(portrait ? { left: '40%', top: '43%' } : { left: '71%', top: '60%' }) }}
            lebar={portrait ? 20 * s : 130 * sx}
            tinggi={portrait ? 32 * s : 150 * s}
            rotasi={0}
            delay={500}
            durasi={2100}
          />
          <View style={[styles.blokTeks, portrait ? { left: '4%', right: '4%', top: '36%' } : { left: '41%', right: '23%', top: '50.3%' }]}>
            <Text style={[styles.judul, { fontSize: ukuranJudul, textAlign: 'center' }]}>Mari kita tes!!!</Text>
          </View>
          <Melayang
            style={[styles.stiker, portrait ? { left: '60%', top: '62%', width: 100 * s } : { left: '73%', top: '35%', width: 230 * sx }]}
            delay={200}
            durasi={2000}
          >
            <Pressable style={styles.tombolGambar} onPress={() => go('loading')} accessibilityLabel="Mulai tes">
              <ExpoImage source={require('../../assets/chibi-tunjuk.webp')} style={styles.stikerGambar} contentFit="contain" />
            </Pressable>
          </Melayang>
          <Melayang
            style={[styles.stiker, portrait ? { left: '36%', top: '27%', width: 66 * s } : { left: '28%', top: '16.5%', width: 129 * sx }]}
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
  layar: { flex: 1, backgroundColor: '#fff', overflow: 'hidden' },
  kanvas: { position: 'absolute', backgroundColor: '#fff', overflow: 'hidden' },
  tombolKembali: { position: 'absolute', top: 12, right: 12, zIndex: 5, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.9)' },
  tombolKembaliTeks: { color: '#1a73e8', fontWeight: 'bold', fontSize: 14 },
  frame: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  stiker: { position: 'absolute', aspectRatio: 1 },
  stikerGambar: { width: '100%', height: '100%' },
  tombolGambar: { width: '100%', height: '100%' },
  blokTeks: { position: 'absolute', alignItems: 'center' },
  judul: { fontFamily: SERIF, color: MERAH_TEKS },
  lanjut: { fontFamily: SERIF, color: '#111' },
});
