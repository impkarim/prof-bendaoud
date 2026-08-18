import { json, error, missing, isConfigured, supabaseRequest, getSettings, sendTelegram } from "./_shared.js";

const TYPES = {
  general: { ar: "استشارة قانونية عامة", en: "General Legal Consultation", priceAr: "5000 دج", priceEn: "5000 DZD" },
  business: { ar: "استشارة قانون تجاري", en: "Business Law Consultation", priceAr: "8000 دج", priceEn: "8000 DZD" },
  international: { ar: "استشارة قانون دولي", en: "International Law Consultation", priceAr: "15000 دج", priceEn: "15000 DZD" },
  academic: { ar: "استشارة أكاديمية", en: "Academic Consultation", priceAr: "4000 دج", priceEn: "4000 DZD" },
};

export default async function handler(request) {
  if (request.method !== "POST") return error(request, "Method not allowed");
  if (!isConfigured()) return missing();

  let body;
  try {
    body = await request.json();
  } catch {
    return error(request, "Invalid JSON body");
  }

  const { reference, type, date, time, name, phone, email, details, language } = body;

  if (!reference || !type || !date || !time || !name || !phone || !email) {
    return error(request, "Missing required fields");
  }
  if (!details || details.length < 10) {
    return error(request, "Details must be at least 10 characters");
  }

  const settings = await getSettings();
  if (settings && settings.paused) {
    return json(request, 200, { success: false, paused: true });
  }

  const rpcRes = await supabaseRequest("rpc/create_booking", {
    method: "POST",
    body: JSON.stringify({
      p_reference: reference,
      p_type: type,
      p_date: date,
      p_time: time,
      p_name: name,
      p_phone: phone,
      p_email: email,
      p_details: details,
      p_language: language || "ar",
    }),
  });

  const result = await rpcRes.json();

  if (!rpcRes.ok) {
    console.error("[create-booking] RPC error:", result);
    return json(request, 500, { success: false, error: "Database error" });
  }

  if (!result || result.success === false) {
    if (result && result.error === "slot_taken") {
      return json(request, 200, { success: false, slotTaken: true });
    }
    return json(request, 200, { success: false, error: "Booking rejected" });
  }

  const t = TYPES[type] || TYPES.general;
  const isAr = language !== "en";
  const typeLabel = isAr ? t.ar : t.en;
  const price = isAr ? t.priceAr : t.priceEn;
  const lines = [
    "📌 <b>" + (isAr ? "طلب حجز جديد" : "New Booking Request") + "</b>",
    "━━━━━━━━━━━━━━━",
    "🆔 " + (isAr ? "رقم الحجز" : "Reference") + ": <code>" + reference + "</code>",
    "👤 " + (isAr ? "الاسم" : "Name") + ": " + name,
    "📞 " + (isAr ? "الهاتف" : "Phone") + ": " + phone,
    "✉️ " + (isAr ? "البريد" : "Email") + ": " + email,
    "⚖️ " + (isAr ? "نوع الاستشارة" : "Consultation") + ": " + typeLabel,
    "💵 " + (isAr ? "المبلغ" : "Amount") + ": " + price,
    "📅 " + (isAr ? "التاريخ" : "Date") + ": " + date,
    "⏰ " + (isAr ? "الوقت" : "Time") + ": " + time,
    "📝 " + (isAr ? "وصف الاستشارة" : "Details") + ": " + details,
  ];
  await sendTelegram(lines.join("\n"));

  return json(request, 200, { success: true, reference });
}