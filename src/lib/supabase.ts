import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Allow graceful degradation when Supabase credentials are not provided
// The app will work fully as guest without authentication
let supabase: ReturnType<typeof createClient<Database>> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Get the Supabase client instance
 * Returns null if Supabase is not configured (guest-only mode)
 */
export function getSupabaseClient(): ReturnType<typeof createClient<Database>> | null {
  return supabase;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

// Re-export for backward compatibility (will throw if not configured)
export function getSupabaseOrThrow(): ReturnType<typeof createClient<Database>> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
  }
  return supabase;
}
