import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config';

const supabaseUrl = SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
