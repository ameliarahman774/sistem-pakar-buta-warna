// Klien Supabase — Sistem Pakar Buta Warna.
// Dibaca dari .env (Expo): EXPO_PUBLIC_SUPABASE_URL dan
// EXPO_PUBLIC_SUPABASE_ANON_KEY. JANGAN taruh service_role key di sini —
// anon key saja. .env tidak ikut di-push ke GitHub (lihat .gitignore).
// Kalau env belum diisi, aplikasi TIDAK crash: isSupabaseConfigured()
// mengembalikan false dan database.js memakai bundled knowledge base
// (src/data/) sebagai fallback, jadi konsultasi tetap bisa jalan offline.

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
      supabaseUrl.startsWith('http') &&
      supabaseAnonKey &&
      supabaseAnonKey.length > 10,
  );
}

// Client hanya dibuat kalau env terisi; kalau tidak, export null dan
// pemanggil (database.js) harus cek isSupabaseConfigured() dulu.
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function butuhSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase belum dikonfigurasi. Isi EXPO_PUBLIC_SUPABASE_URL dan ' +
        'EXPO_PUBLIC_SUPABASE_ANON_KEY di file .env (lihat .env.example dan README), ' +
        'lalu restart dengan npx expo start -c.',
    );
  }
  return supabase;
}
