const SUPABASE_URL = "https://izqixlrtdwtvzbtzvezc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_W7VQ9dLnWyP-_QTNBoUXwA_H3BjRb4y";

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
