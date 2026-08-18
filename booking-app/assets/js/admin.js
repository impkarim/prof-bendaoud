const API_BASE = "/api";
const TYPES = {
  general: { ar: "استشارة قانونية عامة", en: "General Legal Consultation" },
  business: { ar: "استشارة قانون تجاري", en: "Business Law Consultation" },
  international: { ar: "استشارة قانون دولي", en: "International Law Consultation" },
  academic: { ar: "استشارة أكاديمية", en: "Academic Consultation" },
};
const ALL_HOURS = [];
for (let h = 9; h < 17; h += 0.5) {
  ALL_HOURS.push(`${String(Math.floor(h)).padStart(2, "0")}:${h % 1 === 0 ? "00" : "30"}`);
}
const WEEKDAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الاثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

let currentSettings = { paused: false, working_days: [0, 1, 2, 3, 4, 6], slots: [] };

async function api(action, payload = {}) {
  const password = sessionStorage.getItem("admin-pass") || "";
  const res = await fetch(`${API_BASE}/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, password, ...payload }),
  });
  return res.json();
}

function showLogin() {
  document.getElementById("login-view").classList.remove("hidden");
  document.getElementById("dashboard-view").classList.add("hidden");
  document.getElementById("logout-btn").classList.add("hidden");
}

function showDashboard() {
  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("dashboard-view").classList.remove("hidden");
  document.getElementById("logout-btn").classList.remove("hidden");
}

function typeLabel(id) {
  const t = TYPES[id] || TYPES.general;
  return t.ar;
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("ar-DZ", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function renderBookings(bookings) {
  const list = document.getElementById("bookings-list");
  document.getElementById("booking-count").textContent = bookings.length;

  if (!bookings.length) {
    list.innerHTML = `<div class="p-8 text-center text-gray-400 text-sm"><i class="fas fa-inbox text-2xl mb-3 block text-gray-600"></i>لا توجد حجوزات بعد</div>`;
    return;
  }

  list.innerHTML = bookings
    .map(
      (b) => `
      <div class="p-5 hover:bg-white/[0.03] transition-colors">
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
          <span class="inline-flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit">
            <i class="fas fa-tag"></i><span dir="ltr">${b.reference}</span>
          </span>
          <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
            b.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          } w-fit">
            ${b.status === "pending" ? "بانتظار الدفع" : "مؤكد"}
          </span>
          <span class="text-gray-500 text-xs ms-auto">${new Date(b.created_at).toLocaleString("ar-DZ")}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3">
          <div>
            <p class="text-gray-500 text-xs mb-0.5">الاسم</p>
            <p class="text-white font-bold">${b.name}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-0.5">الهاتف / البريد</p>
            <p class="text-white" dir="ltr">${b.phone}</p>
            <p class="text-gray-400 text-xs" dir="ltr">${b.email}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-0.5">الموعد</p>
            <p class="text-white font-bold">${typeLabel(b.type)}</p>
            <p class="text-gray-400 text-xs">${formatDate(b.date)} — <span dir="ltr">${b.time}</span></p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-0.5">الوصف</p>
            <p class="text-gray-300 text-xs leading-relaxed line-clamp-2">${b.details || "—"}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button data-cancel="${b.id}" class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
            <i class="fas fa-trash-alt"></i>إلغاء الحجز
          </button>
        </div>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-cancel]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.cancel;
      if (!confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) return;
      const result = await api("cancel", { id });
      if (result.success) {
        loadDashboard();
      } else {
        alert(result.error || "فشل الإلغاء");
      }
    });
  });
}

function renderSettings() {
  document.getElementById("pause-status").textContent = currentSettings.paused ? "متوقفة مؤقتاً" : "نشطة";
  const pauseBtn = document.getElementById("pause-btn");
  if (currentSettings.paused) {
    pauseBtn.textContent = "استئناف";
    pauseBtn.className = "px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-emerald-600 text-white";
  } else {
    pauseBtn.textContent = "إيقاف مؤقت";
    pauseBtn.className = "px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-red-500 text-white";
  }

  const slots = currentSettings.slots && currentSettings.slots.length ? currentSettings.slots : ALL_HOURS;
  document.getElementById("slots-summary").textContent = `${slots.length} وقت متاح يومياً (${slots[0] || "09:00"} - ${slots[slots.length - 1] || "16:30"})`;
}

function openSlotsModal() {
  const days = currentSettings.working_days && currentSettings.working_days.length ? currentSettings.working_days : [0, 1, 2, 3, 4, 6];
  const slots = currentSettings.slots && currentSettings.slots.length ? currentSettings.slots : ALL_HOURS;

  const daysGrid = document.getElementById("days-grid");
  daysGrid.innerHTML = WEEKDAYS.map(
    (d) => `
    <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
      days.includes(d.value) ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "border-gray-600 text-gray-400"
    }">
      <input type="checkbox" value="${d.value}" ${days.includes(d.value) ? "checked" : ""} class="day-check hidden">
      ${d.label}
    </label>`
  ).join("");

  const slotsGrid = document.getElementById("slots-grid");
  slotsGrid.innerHTML = ALL_HOURS.map(
    (h) => `
    <label class="inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border cursor-pointer transition-colors text-xs ${
      slots.includes(h) ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "border-gray-600 text-gray-500"
    }">
      <input type="checkbox" value="${h}" ${slots.includes(h) ? "checked" : ""} class="slot-check hidden">
      <span dir="ltr">${h}</span>
    </label>`
  ).join("");

  daysGrid.querySelectorAll(".day-check").forEach((cb) => {
    cb.addEventListener("change", () => {
      const label = cb.closest("label");
      if (cb.checked) {
        label.classList.remove("border-gray-600", "text-gray-400");
        label.classList.add("bg-amber-500/10", "border-amber-500/40", "text-amber-300");
      } else {
        label.classList.remove("bg-amber-500/10", "border-amber-500/40", "text-amber-300");
        label.classList.add("border-gray-600", "text-gray-400");
      }
    });
  });

  slotsGrid.querySelectorAll(".slot-check").forEach((cb) => {
    cb.addEventListener("change", () => {
      const label = cb.closest("label");
      if (cb.checked) {
        label.classList.remove("border-gray-600", "text-gray-500");
        label.classList.add("bg-amber-500/10", "border-amber-500/40", "text-amber-300");
      } else {
        label.classList.remove("bg-amber-500/10", "border-amber-500/40", "text-amber-300");
        label.classList.add("border-gray-600", "text-gray-500");
      }
    });
  });

  document.getElementById("slots-modal").classList.remove("hidden");
}

function closeSlotsModal() {
  document.getElementById("slots-modal").classList.add("hidden");
}

async function loadDashboard() {
  const result = await api("list");
  if (!result.success) {
    showLogin();
    return;
  }
  if (result.settings) currentSettings = result.settings;
  renderSettings();
  renderBookings(result.bookings || []);
  showDashboard();
}

function bindEvents() {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("admin-password").value;
    sessionStorage.setItem("admin-pass", password);
    const result = await api("login");
    if (result.success) {
      document.getElementById("admin-password").value = "";
      loadDashboard();
    } else {
      sessionStorage.removeItem("admin-pass");
      alert(result.error === "Unauthorized" ? "كلمة مرور غير صحيحة" : result.error || "خطأ في الدخول");
    }
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("admin-pass");
    showLogin();
  });

  document.getElementById("pause-btn").addEventListener("click", async () => {
    const result = await api("toggle_pause");
    if (result.success) {
      currentSettings.paused = result.paused;
      renderSettings();
    }
  });

  document.getElementById("refresh-btn").addEventListener("click", loadDashboard);

  document.getElementById("edit-slots-btn").addEventListener("click", openSlotsModal);
  document.getElementById("close-slots-modal").addEventListener("click", closeSlotsModal);
  document.getElementById("cancel-slots-btn").addEventListener("click", closeSlotsModal);

  document.getElementById("save-slots-btn").addEventListener("click", async () => {
    const workingDays = [...document.querySelectorAll(".day-check:checked")].map((cb) => Number(cb.value));
    const slots = [...document.querySelectorAll(".slot-check:checked")].map((cb) => cb.value).sort();
    if (!workingDays.length) {
      alert("يجب اختيار يوم عمل واحد على الأقل");
      return;
    }
    if (!slots.length) {
      alert("يجب اختيار وقت واحد على الأقل");
      return;
    }
    const result = await api("set_slots", { workingDays, slots });
    if (result.success) {
      currentSettings.working_days = workingDays;
      currentSettings.slots = slots;
      closeSlotsModal();
      renderSettings();
    } else {
      alert(result.error || "فشل الحفظ");
    }
  });
}

function init() {
  bindEvents();
  if (sessionStorage.getItem("admin-pass")) {
    loadDashboard();
  } else {
    showLogin();
  }
}

document.addEventListener("DOMContentLoaded", init);