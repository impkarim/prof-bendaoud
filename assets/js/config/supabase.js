const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

let supabaseClient = null;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  if (typeof window.supabase === "undefined") {
    console.error(
      "[Supabase] Supabase library is not loaded. Ensure the SDK script is included in index.html."
    );
    return null;
  }

  try {
    const { createClient } = window.supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  } catch (error) {
    console.error("[Supabase] Failed to initialize Supabase client:", error);
    return null;
  }
}

export default getSupabaseClient;
