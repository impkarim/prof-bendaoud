import { booking as bookingAr } from "../data/booking-ar.js";
import { booking as bookingEn } from "../data/booking-en.js";

const WORKING_DAYS_DEFAULT = [0, 1, 2, 3, 4, 6];
const SLOTS_DEFAULT = [];
const DAYS_AHEAD = 14;
const API_BASE = "/api";

let lang = localStorage.getItem("ibendaoud-lang") || "ar";
let state = {
  type: null,
  date: null,
  time: null,
  name: "",
  phone: "",
  email: "",
  details: "",
  reference: "",
};
let settings = { paused: false, workingDays: WORKING_DAYS_DEFAULT, slots: SLOTS_DEFAULT };

function getData() {
  return lang === "en" ? bookingEn : bookingAr;
}

function applyLang() {
  const d = getData();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.classList.remove("lang-ar", "lang-en");
  document.documentElement.classList.add("lang-" + lang);
  document.getElementById("page-heading").textContent = d.heading;
  document.getElementById("page-subtitle").textContent = d.subtitle;
  document.getElementById("lang-label").textContent = lang === "ar" ? "English" : "العربية";
}

function formatDate(date) {
  return date.toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function generateDays() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  const wd = settings.workingDays && settings.workingDays.length ? settings.workingDays : WORKING_DAYS_DEFAULT;
  return days.filter((d) => wd.includes(d.getDay()));
}

async function fetchAvailability(date) {
  try {
    const res = await fetch(`${API_BASE}/availability?date=${encodeURIComponent(formatDateKey(date))}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success) {
      settings.paused = Boolean(data.paused);
      if (data.workingDays && data.workingDays.length) settings.workingDays = data.workingDays;
      if (data.slots && data.slots.length) settings.slots = data.slots;
    }
  } catch (err) {
    console.error("[Booking] availability error:", err);
  }
}

function generateSlots() {
  if (settings.slots && settings.slots.length) return settings.slots;
  const slots = [];
  for (let h = 9; h < 17; h += 0.5) {
    slots.push(`${String(Math.floor(h)).padStart(2, "0")}:${h % 1 === 0 ? "00" : "30"}`);
  }
  return slots;
}

async function renderStep(stepHTML) {
  const app = document.getElementById("booking-app");
  if (app) app.innerHTML = stepHTML;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPaused() {
  const d = getData();
  renderStep(`
    <div class="max-w-xl mx-auto text-center">
      <div class="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl mb-6">
        <i class="fas fa-pause-circle"></i>
      </div>
      <h2 class="text-2xl lg:text-3xl font-bold text-white font-title mb-4">${d.heading}</h2>
      <p class="text-gray-400 text-base leading-relaxed">${d.pausedMsg}</p>
    </div>
  `);
}

async function renderTypes() {
  const d = getData();
  if (settings.paused) { renderPaused(); return; }

  const cards = d.types
    .map(
      (t) => `
      <button data-type="${t.id}" class="type-card text-left group relative flex flex-col bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-gray-700/30 hover:border-amber-500/40 transition-all duration-300 p-6 backdrop-blur-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10">
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl group-hover:scale-110 transition-transform">
            <i class="fas ${t.icon}"></i>
          </div>
          <span class="text-amber-400 font-bold text-lg">${t.price}</span>
        </div>
        <h3 class="text-white font-bold text-base lg:text-lg font-title mb-2">${t.title}</h3>
        <p class="text-gray-400 text-xs lg:text-sm leading-relaxed mb-4 flex-1">${t.desc}</p>
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <i class="fas fa-clock text-amber-400/70"></i>${t.duration}
          </span>
          <span class="inline-flex items-center gap-1.5 text-xs text-amber-400/80">
            ${d.chooseLabel}<i class="fas fa-chevron-${lang === "ar" ? "left" : "right"}"></i>
          </span>
        </div>
      </button>`
    )
    .join("");

  await renderStep(`
    <div>
      <div class="text-center mb-8">
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${d.typesHeading}</h2>
        <p class="text-gray-400 text-sm mt-2">${d.typesSubheading}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        ${cards}
      </div>
    </div>
  `);

  document.querySelectorAll(".type-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.type = card.dataset.type;
      renderDates();
    });
  });
}

function renderDates() {
  const d = getData();
  const days = generateDays();

  const dayCells = days
    .map((day) => {
      const selected = state.date && formatDateKey(state.date) === formatDateKey(day);
      const weekday = day.toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB", { weekday: "short" });
      const dayNum = day.toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB", { day: "numeric" });
      const month = day.toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB", { month: "short" });
      return `
      <button data-date="${formatDateKey(day)}" class="date-cell rounded-xl border px-2 py-3 text-center transition-all duration-200 ${
        selected
          ? "bg-amber-500/15 border-amber-500/50 text-amber-300"
          : "bg-white/[0.02] border-gray-700/30 text-gray-300 hover:border-amber-500/40 hover:bg-white/[0.04]"
      }">
        <span class="block text-[11px] opacity-80 mb-1">${weekday}</span>
        <span class="block text-sm font-bold">${dayNum} ${month}</span>
      </button>`;
    })
    .join("");

  renderStep(`
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${d.dateHeading}</h2>
        <button id="back-types" class="text-sm text-gray-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1">
          <i class="fas fa-arrow-${lang === "ar" ? "right" : "left"} me-1"></i>${d.backToSlots}
        </button>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5">
        ${dayCells}
      </div>
    </div>
  `);

  document.querySelectorAll(".date-cell").forEach((cell) => {
    cell.addEventListener("click", async () => {
      const date = new Date(cell.dataset.date + "T00:00:00");
      state.date = date;
      renderSlots();
    });
  });
  document.querySelector("#back-types").addEventListener("click", () => {
    state.date = null;
    renderTypes();
  });
}

async function renderSlots() {
  const d = getData();
  const slots = generateSlots();

  await renderStep(`
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${d.slotHeading}</h2>
        <button id="back-dates" class="text-sm text-gray-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1">
          <i class="fas fa-arrow-${lang === "ar" ? "right" : "left"} me-1"></i>${d.backToSlots}
        </button>
      </div>
      <p class="text-gray-400 text-sm mb-6">${formatDate(state.date)}</p>
      <div id="slot-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        ${slots
          .map(
            () => `
          <div class="slot-loading rounded-xl border border-gray-700/30 bg-white/[0.02] px-3 py-2.5 flex items-center justify-center">
            <i class="fas fa-spinner fa-spin text-amber-400/60 text-sm"></i>
          </div>`
          )
          .join("")}
      </div>
      <p class="text-gray-500 text-xs mt-6 flex items-center gap-2">
        <i class="fas fa-info-circle text-amber-400/60"></i>${d.unavailableNote}
      </p>
    </div>
  `);

  document.querySelector("#back-dates").addEventListener("click", () => {
    state.time = null;
    renderDates();
  });

  const grid = document.querySelector("#slot-grid");
  slots.forEach((time) => {
    const btn = document.createElement("button");
    btn.dataset.time = time;
    btn.innerHTML = `<span dir="ltr">${time}</span>`;
    btn.className = "slot-cell rounded-xl border px-3 py-2.5 text-sm font-bold transition-all duration-200 bg-white/[0.02] border-gray-700/30 text-gray-300 hover:border-amber-500/40 hover:bg-white/[0.04]";
    if (state.time === time) {
      btn.className = "slot-cell rounded-xl border px-3 py-2.5 text-sm font-bold transition-all duration-200 bg-amber-500/15 border-amber-500/50 text-amber-300";
    }
    btn.addEventListener("click", () => {
      state.time = time;
      renderForm();
    });
    grid.appendChild(btn);
  });

  await fetchAvailability(state.date).then(() => {
    if (settings.paused) { renderPaused(); return; }
    const res = fetch(`${API_BASE}/availability?date=${encodeURIComponent(formatDateKey(state.date))}`).then((r) => r.json());
    res.then((data) => {
      if (!data.success) return;
      const bookedTimes = data.booked || [];
      grid.querySelectorAll(".slot-cell").forEach((cell) => {
        if (bookedTimes.includes(cell.dataset.time)) {
          cell.disabled = true;
          cell.classList.remove("bg-white/[0.02]", "border-gray-700/30", "text-gray-300", "hover:border-amber-500/40", "hover:bg-white/[0.04]", "bg-amber-500/15", "border-amber-500/50", "text-amber-300");
          cell.classList.add("border-gray-700/20", "text-gray-600", "cursor-not-allowed", "line-through");
        }
      });
    });
  });
}

function renderForm() {
  const d = getData();
  const selectedType = d.types.find((t) => t.id === state.type);

  renderStep(`
    <div>
      <div class="text-center mb-8">
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${d.formHeading}</h2>
        <p class="text-gray-400 text-sm mt-2">${d.formSubheading}</p>
      </div>

      <div class="bg-white/[0.02] border border-gray-700/30 rounded-2xl p-5 mb-6">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.typeLabel}</p>
            <p class="text-white font-bold">${selectedType.title}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.dateLabel}</p>
            <p class="text-white font-bold">${formatDate(state.date)}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.timeLabel}</p>
            <p class="text-white font-bold" dir="ltr">${state.time}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.priceLabel}</p>
            <p class="text-amber-400 font-bold">${selectedType.price}</p>
          </div>
        </div>
      </div>

      <form id="booking-form" class="space-y-5 bg-white/[0.02] border border-gray-700/30 rounded-2xl p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-gray-300 text-sm font-bold mb-2">${d.nameLabel}</label>
            <input id="b-name" type="text" required class="w-full bg-slate-800/70 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors" placeholder="${d.namePlaceholder}">
          </div>
          <div>
            <label class="block text-gray-300 text-sm font-bold mb-2">${d.phoneLabel}</label>
            <input id="b-phone" type="tel" required dir="ltr" class="w-full bg-slate-800/70 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-left" placeholder="${d.phonePlaceholder}">
          </div>
        </div>
        <div>
          <label class="block text-gray-300 text-sm font-bold mb-2">${d.emailLabel}</label>
          <input id="b-email" type="email" required dir="ltr" class="w-full bg-slate-800/70 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-left" placeholder="${d.emailPlaceholder}">
        </div>
        <div>
          <label class="block text-gray-300 text-sm font-bold mb-2">${d.detailsLabel}</label>
          <textarea id="b-details" rows="4" required class="w-full bg-slate-800/70 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none" placeholder="${d.detailsPlaceholder}"></textarea>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button id="back-slots" type="button" class="flex-1 border border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 rounded-xl px-6 py-3 text-sm font-bold transition-colors">${d.backToSlots}</button>
          <button type="submit" class="flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 inline-flex items-center justify-center gap-2">
            <i class="fas fa-calendar-check"></i>${d.submitBtn}
          </button>
        </div>
      </form>
    </div>
  `);

  document.querySelector("#back-slots").addEventListener("click", () => {
    state.time = null;
    renderSlots();
  });

  const form = document.querySelector("#booking-form");
  const submitBtn = form.querySelector("button[type='submit']");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    state.name = document.querySelector("#b-name").value.trim();
    state.phone = document.querySelector("#b-phone").value.trim();
    state.email = document.querySelector("#b-email").value.trim();
    state.details = document.querySelector("#b-details").value.trim();

    if (!state.name || !state.phone || !state.email || !state.details) {
      alert(d.formHeading);
      return;
    }

    state.reference = `BB-${Date.now().toString(36).toUpperCase()}`;

    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>${d.submittingBtn}`;

    let result;
    try {
      const res = await fetch(`${API_BASE}/create-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: state.reference,
          type: state.type,
          date: formatDateKey(state.date),
          time: state.time,
          name: state.name,
          phone: state.phone,
          email: state.email,
          details: state.details,
          language: lang,
        }),
      });
      result = await res.json();
    } catch (err) {
      console.error("[Booking] create error:", err);
      result = { success: false };
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;

    if (!result.success) {
      if (result.paused) {
        alert(d.pausedMsg);
        renderPaused();
        return;
      }
      if (result.slotTaken) {
        alert(d.slotTakenMsg);
        state.time = null;
        renderSlots();
        return;
      }
      alert(d.bookingErrorMsg);
      return;
    }

    renderPayment();
  });
}

function renderPayment() {
  const d = getData();
  const selectedType = d.types.find((t) => t.id === state.type);

  const whatsappUrl = `https://wa.me/213676273636?text=${encodeURIComponent(
    `${lang === "ar" ? "تأكيد الحجز" : "Booking confirmation"} ${state.reference}`
  )}`;

  const steps = d.paymentSteps
    .map(
      (s, i) => `
      <li class="flex items-start gap-3">
        <span class="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">${i + 1}</span>
        <span class="text-gray-300 text-sm leading-relaxed">${s}</span>
      </li>`
    )
    .join("");

  renderStep(`
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl mb-4">
          <i class="fas fa-check"></i>
        </div>
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${d.paymentHeading}</h2>
        <p class="text-gray-400 text-sm mt-2">${d.paymentSubtitle}</p>
      </div>

      <div class="bg-white/[0.02] border border-gray-700/30 rounded-2xl p-6 mb-6">
        <h3 class="text-white font-bold text-lg font-title mb-4 flex items-center gap-2">
          <i class="fas fa-file-invoice text-amber-400"></i>${d.summaryHeading}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.referenceLabel}</p>
            <p class="text-amber-400 font-bold font-mono" dir="ltr">${state.reference}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.typeLabel}</p>
            <p class="text-white font-bold">${selectedType.title}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.dateLabel}</p>
            <p class="text-white font-bold">${formatDate(state.date)}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.timeLabel}</p>
            <p class="text-white font-bold" dir="ltr">${state.time}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.durationLabel}</p>
            <p class="text-gray-300">${selectedType.duration}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${d.priceLabel}</p>
            <p class="text-amber-400 font-bold">${selectedType.price}</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/25 rounded-2xl p-6 mb-6">
        <h3 class="text-white font-bold text-lg font-title mb-4 flex items-center gap-2">
          <i class="fas fa-landmark text-amber-400"></i>${d.ccpLabel}
        </h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between items-center bg-slate-800/60 border border-gray-600 rounded-xl px-4 py-3">
            <span class="text-gray-400">${d.ccpHolder}</span>
            <span class="text-white font-bold">${lang === "ar" ? "براهيم بن داود" : "Brahim Bendaoud"}</span>
          </div>
          <div class="flex justify-between items-center bg-slate-800/60 border border-gray-600 rounded-xl px-4 py-3">
            <span class="text-gray-400">${d.ccpLabel}</span>
            <span class="text-white font-bold font-mono" dir="ltr">0000 0000 0000 00</span>
          </div>
          <div class="flex justify-between items-center bg-slate-800/60 border border-amber-500/30 rounded-xl px-4 py-3">
            <span class="text-gray-400">${d.ccpAmount}</span>
            <span class="text-amber-400 font-bold text-lg">${selectedType.price}</span>
          </div>
        </div>
      </div>

      <div class="bg-white/[0.02] border border-gray-700/30 rounded-2xl p-6 mb-6">
        <h3 class="text-white font-bold text-lg font-title mb-4">${d.paymentHeading}</h3>
        <ol class="space-y-3">${steps}</ol>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <a href="${whatsappUrl}" target="_blank" rel="noopener" class="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 shadow-lg shadow-emerald-500/20">
          <i class="fab fa-whatsapp text-lg"></i>${d.contactWhatsApp}
        </a>
        <a href="mailto:contact@brahimbendaoud.com?subject=${encodeURIComponent(`${lang === "ar" ? "تأكيد الحجز" : "Booking confirmation"} ${state.reference}`)}" class="flex-1 inline-flex items-center justify-center gap-2 border border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 rounded-xl px-6 py-3 text-sm font-bold transition-colors">
          <i class="fas fa-envelope"></i>${d.contactEmail}
        </a>
      </div>

      <p class="text-center text-gray-500 text-xs flex items-center justify-center gap-2">
        <i class="fas fa-exclamation-circle text-amber-400/60"></i>${d.note}
      </p>
    </div>
  `);
}

function initTheme() {
  const stored = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", stored);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

function initLang() {
  document.getElementById("lang-toggle").addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("ibendaoud-lang", lang);
    applyLang();
    renderTypes();
  });
}

async function init() {
  initTheme();
  initLang();
  applyLang();
  await fetchAvailability(new Date());
  renderTypes();
}

document.addEventListener("DOMContentLoaded", init);