import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://niejocfnxffguhnzxucp.supabase.co"
const supabaseAnonKey = "sb_publishable_TkaBZa7lxzSJlE1QlanG9A_omE_noFX";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or key is missing. Copy .env.example to .env and fill in your project details."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
