import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://knoggedklgjpgcrobbeb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_jIttLPUQXVHkRaiZwT4bGA_ysTpHeFy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Health check helper
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('competitions').select('id').limit(1);
    return !error && Array.isArray(data);
  } catch (err) {
    console.warn('[NovaSport] Supabase connectivity check failed:', err);
    return false;
  }
}
