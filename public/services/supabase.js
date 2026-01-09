import { createClient } from "@supabase/supabase-js";
import { IRA_CONFIG } from "../config.js";

export const supabase = createClient(
  IRA_CONFIG.SUPABASE_URL,
  IRA_CONFIG.SUPABASE_ANON_KEY
);
