import { createClient } from '@supabase/supabase-js';

// These should be in your .env.local file
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for browser usage (public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side operations (protected)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/****** Utils ******/

export function handleSupabaseError(error: unknown) {
  throw error; // @dev TODO: handle this gracefully
}
