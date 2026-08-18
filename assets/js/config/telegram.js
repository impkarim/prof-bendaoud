const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";

const TELEGRAM_API = "https://api.telegram.org/bot";

export function getTelegramConfig() {
  return {
    enabled: !TELEGRAM_BOT_TOKEN.startsWith("YOUR") && !TELEGRAM_CHAT_ID.startsWith("YOUR"),
    url: `${TELEGRAM_API}${TELEGRAM_BOT_TOKEN}/sendMessage`,
    chatId: TELEGRAM_CHAT_ID,
  };
}

export async function sendTelegramMessage(text) {
  const config = getTelegramConfig();
  if (!config.enabled) {
    console.info("[Telegram] Not configured. Skipping notification.");
    return false;
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    const result = await response.json();
    if (!result.ok) {
      console.error("[Telegram] sendMessage error:", result.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Telegram] Unexpected error:", err);
    return false;
  }
}

export default sendTelegramMessage;