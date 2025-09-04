import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// IMPORTANT: Replace with your actual Supabase URL and Anon Key
// You can find these in your Supabase project settings under "API"
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn(
    'Supabase client is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables or replace placeholder values in `utils/supabase.ts` with your actual Supabase URL and Anon Key.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);