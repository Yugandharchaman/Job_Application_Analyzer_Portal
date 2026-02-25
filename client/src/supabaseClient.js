import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL 
  || 'https://murhqlbkealeamctmjvw.supabase.co';

const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cmhxbGJrZWFsZWFtY3RtanZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDE4NzgsImV4cCI6MjA4NTUxNzg3OH0.GPwZ5pr612suaTBYHkIvq_UwOMro4zKbN5a8NO10dxU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});