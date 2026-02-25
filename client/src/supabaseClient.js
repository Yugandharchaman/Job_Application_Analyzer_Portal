import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://murhqlbkealeamctmjvw.supabase.co';
const supabaseAnonKey = 'sb_publishable_a1ww02cBcb1sD5AnT5sNDQ_jZi8iLJJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);