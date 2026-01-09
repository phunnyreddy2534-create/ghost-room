import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const supabase = createClient(
  window.IRA_CONFIG.SUPABASE_URL,
  window.IRA_CONFIG.SUPABASE_ANON_KEY
);
