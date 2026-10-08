import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://jphxwxkkurzkcirkdqee.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_abDbt5DJEMxJn_4uUqWCXQ_0CCg8aSU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
