import { json, error, missing, isConfigured, supabaseRequest, getSettings } from "./_shared.js";

function checkPassword(body) {
  const password = body && body.password;
  return password && password === process.env.ADMIN_PASSWORD;
}

function requireAuth(request, body) {
  if (!isConfigured()) return missing();
  if (!checkPassword(body)) {
    return json(request, 401, { success: false, error: "Unauthorized" });
  }
  return null;
}

export default async function handler(request) {
  if (request.method !== "POST") return error(request, "Method not allowed");
  if (!isConfigured()) return missing();

  let body;
  try {
    body = await request.json();
  } catch {
    return error(request, "Invalid JSON body");
  }

  const action = body.action;
  if (!action) return error(request, "Missing action");

  const authError = requireAuth(request, body);
  if (authError) return authError;

  switch (action) {
    case "login":
      return json(request, 200, { success: true });

    case "list":
      return handleList(request);

    case "cancel": {
      const id = body.id;
      if (!id) return error(request, "Missing booking id");
      const res = await supabaseRequest(`bookings?id=eq.${id}`, {
        method: "DELETE",
      });
      if (!res.ok) return json(request, 500, { success: false, error: "Delete failed" });
      return json(request, 200, { success: true });
    }

    case "toggle_pause": {
      const settings = (await getSettings()) || {};
      const next = !Boolean(settings.paused);
      const res = await supabaseRequest("settings?id=eq.1", {
        method: "PATCH",
        body: JSON.stringify({ paused: next }),
      });
      if (!res.ok) return json(request, 500, { success: false, error: "Update failed" });
      return json(request, 200, { success: true, paused: next });
    }

    case "set_slots": {
      const slots = body.slots;
      const workingDays = body.workingDays;
      if (!Array.isArray(slots) || !Array.isArray(workingDays)) {
        return error(request, "Invalid slots or workingDays");
      }
      const res = await supabaseRequest("settings?id=eq.1", {
        method: "PATCH",
        body: JSON.stringify({ slots, working_days: workingDays }),
      });
      if (!res.ok) return json(request, 500, { success: false, error: "Update failed" });
      return json(request, 200, { success: true, slots, workingDays });
    }

    default:
      return error(request, "Unknown action");
  }
}

async function handleList(request) {
  const res = await supabaseRequest(
    "bookings?select=id,reference,type,date,time,name,phone,email,details,status,language,created_at&order=created_at.desc"
  );
  if (!res.ok) return json(request, 500, { success: false, error: "List failed" });
  const bookings = await res.json();
  const settings = await getSettings();
  return json(request, 200, { success: true, bookings, settings });
}