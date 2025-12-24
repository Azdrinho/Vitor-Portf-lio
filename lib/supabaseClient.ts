import { createClient } from '@supabase/supabase-js';

// URL do seu projeto Supabase
const supabaseUrl = 'https://tpvdohdpfljvotmdogpv.supabase.co';

// Chave Pública (Anon Key) fornecida
const supabaseKey = 'sb_publishable_SoNC_8e6aN4Ek9bTDEzo5g_kSKJCwlf'; 

export const supabase = createClient(supabaseUrl, supabaseKey);