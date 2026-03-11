import { CONFI } from './config.js';

// Initialize the Supabase client using the browser standalone UMD build
// We load the Supabase script in the HTML head: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

export const supabase = window.supabase.createClient(
    CONFI.SUPABASE_URL,
    CONFI.SUPABASE_ANON_KEY
);
