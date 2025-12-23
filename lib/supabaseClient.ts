import { createClient } from '@supabase/supabase-js';

// URL do seu projeto Supabase
const supabaseUrl = 'https://ybkzazuxhzohxkmcsllx.supabase.co';

// Chave Pública (Anon Key) fornecida
const supabaseKey = 'sb_publishable_ucyzUtIjzlgZsYMUGSIypQ_sdMk-Hxj'; 

export const supabase = createClient(supabaseUrl, supabaseKey);