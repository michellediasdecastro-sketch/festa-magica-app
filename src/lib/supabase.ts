import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://jphxwkkurzkcirkdqee.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_abdbt5DJEMxJn_4uUQwCXQ_0CCg8aSU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
