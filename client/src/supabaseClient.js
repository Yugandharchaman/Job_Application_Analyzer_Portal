import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://murhqlbkealeamctmjvw.supabase.co';
// ⚠️ REPLACE THIS with your real anon key from Supabase Dashboard → Settings → API
// It must start with "eyJ..." — the current key is invalid and causes "Failed to fetch"
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cmhxbGJrZWFsZWFtY3RtanZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDE4NzgsImV4cCI6MjA4NTUxNzg3OH0.GPwZ5pr612suaTBYHkIvq_UwOMro4zKbN5a8NO10dxU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  }
});