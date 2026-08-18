import { json, error, missing, isConfigured, supabaseRequest, getSettings } from "./_shared.js";

export default async function handler(request) {
  if (!isConfigured()) return missing();

  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) return error(request, "Missing date parameter");

  const [settings, slotsRes] = await Promise.all([
    getSettings(),
    supabaseRequest(`bookings?select=time&date=eq.${encodeURIComponent(date)}`),
  ]);

  let booked = [];
  if (slotsRes.ok) {
    const rows = await slotsRes.json();
    booked = rows.map((r) => r.time);
  }

  return json(request, 200, {
    success: true,
    paused: settings ? Boolean(settings.paused) : false,
    workingDays: settings && settings.working_days ? settings.working_days : [0, 1, 2, 3, 4, 6],
    slots: settings && settings.slots ? settings.slots : [],
    booked,
  });
}