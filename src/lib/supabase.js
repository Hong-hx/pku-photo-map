import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少 Supabase 环境变量。请复制 .env.example 为 .env 并填入实际值。');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
