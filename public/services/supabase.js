// services/supabase.js
const { createClient } = window.supabase;

window.IRA_DB = createClient(
  window.IRA_CONFIG.SUPABASE_URL,
  window.IRA_CONFIG.SUPABASE_ANON_KEY
);
