import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(value = '') {
  return String(value)
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/i, '')
    .replace(/\/auth\/v1$/i, '');
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

function looksLikeAnonKey(value = '') {
  const lower = value.toLowerCase();
  return (
    value.split('.').length === 3 &&
    !['undefined', 'null', 'tu-anon-key', ''].includes(lower)
  );
}

export const hasSupabaseEnv = Boolean(supabaseUrl && looksLikeAnonKey(supabaseAnonKey));

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'somos-mision-auth-v1',
      },
    })
  : null;
