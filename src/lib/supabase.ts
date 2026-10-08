import { createClient } from '@supabase/supabase-js';

// Substitua estas duas linhas pelos valores reais copiados do Supabase (Project Settings > API)
const supabaseUrl = 'https://jphxwxkkurzkcirkdqee.supabase.co';
const supabaseAnonKey = 'sb_publishable_abDbt5DJEMxJn_4uUqWCXQ_0CCg8aSU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
