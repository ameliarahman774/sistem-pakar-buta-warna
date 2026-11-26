import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

// Layar loading singkat setelah tombol Start ditekan: hanya gambar karakter
// di tengah dengan animasi pop-up sederhana sekitar 0,5 detik,
// lalu otomatis masuk ke tes (konsultasi).
export default function LoadingScreen({ ganti }) {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pop, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }).start();
    const timer = setTimeout(() => ganti('consult'), 600);
    return () => clearTimeout(timer);
  }, [pop, ganti]);

  const skala = pop.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });

  return (
    <View style={styles.layar}>
      <Animated.View style={{ opacity: pop, transform: [{ scale: skala }] }}>
        <ExpoImage source={require('../../assets/loading-character.webp')} style={styles.gambar} contentFit="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  gambar: { width: 240, height: 240 },
});
