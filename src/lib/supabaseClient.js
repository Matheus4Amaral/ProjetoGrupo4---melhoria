import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const FIRST_ACCESS_INVITE_MARKER = "avaliaai:first-access-invite";

if (typeof window !== "undefined") {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  if (query.get("type") === "invite" || hash.get("type") === "invite") {
    sessionStorage.setItem(FIRST_ACCESS_INVITE_MARKER, "true");
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});
