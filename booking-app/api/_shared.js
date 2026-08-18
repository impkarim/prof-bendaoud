const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function json(res, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function error(res, message) {
  return json(res, 400, { success: false, error: message });
}

function missing() {
  return json(null, 500, {
    success: false,
    error: "Server environment not configured. Set env vars in Vercel.",
  });
}

async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res;
}

async function getSettings() {
  const res = await supabaseRequest(
    "settings?select=*&id=eq.1"
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows && rows.length ? rows[0] : null;
}

async function sendTelegram(text) {
  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    }
  );
  const result = await res.json();
  return result.ok === true;
}

function isConfigured() {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_SERVICE_KEY &&
      TELEGRAM_BOT_TOKEN &&
      TELEGRAM_CHAT_ID &&
      ADMIN_PASSWORD
  );
}

export {
  json,
  error,
  missing,
  isConfigured,
  supabaseRequest,
  getSettings,
  sendTelegram,
};