import { initLanguage, getContent, setLanguage, getCurrentLang } from "../services/langService.js";
import { initTheme, toggleTheme } from "../services/themeService.js";
import { initPageTransitions } from "../services/pageTransition.js";
import { renderTopBar, renderNavbar } from "../services/navbarService.js";
import { getSupabaseClient } from "../config/supabase.js";
import { booking as bookingAr } from "../data/booking-ar.js";
import { booking as bookingEn } from "../data/booking-en.js";

const WORKING_DAYS = [0, 1, 2, 3, 4, 6];
const SLOT_START_HOUR = 9;
const SLOT_END_HOUR = 17;
const SLOT_MINUTES = 30;
const DAYS_AHEAD = 14;

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

function getBookingData() {
  const lang = getCurrentLang();
  return lang === "ar" ? bookingAr : bookingEn;
}

function renderFooter() {
  const data = getContent().footer;
  const footer = document.getElementById("footer");
  if (!footer) return;
  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="border-t border-gray-700/50 pt-8">
        <div class="text-center">
          <p class="text-amber-400 font-title text-lg font-bold">${data.motto}</p>
          <p class="text-gray-400 text-sm mt-3">${data.rights}</p>
          <p class="text-gray-500 text-xs mt-1">${data.designer}</p>
        </div>
      </div>
    </div>`;
}

function formatDate(date) {
  const lang = getCurrentLang();
  return date.toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  return days.filter((d) => WORKING_DAYS.includes(d.getDay()));
}

function generateSlots(date) {
  const slots = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h += SLOT_MINUTES / 60) {
    const time = `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 === 0 ? "00" : "30"}`;
    slots.push(time);
  }
  return slots;
}

function isSlotBooked(date, time) {
  const key = `${date.toISOString().slice(0, 10)} ${time}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash % 5 === 0;
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function renderHeading() {
  const data = getBookingData();
  document.getElementById("page-heading").textContent = data.heading;
  document.getElementById("page-subtitle").textContent = data.subtitle;
  document.getElementById("back-label").textContent = data.backLabel;

  const lang = getCurrentLang();
  const backLink = document.getElementById("back-link");
  const icon = backLink.querySelector("i");
  icon.className = lang === "ar" ? "fas fa-arrow-right me-1" : "fas fa-arrow-left mr-1";
}

function renderStep(stepHTML) {
  const app = document.getElementById("booking-app");
  if (app) app.innerHTML = stepHTML;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTypes() {
  const data = getBookingData();
  const cards = data.types
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
            ${data.chooseLabel}<i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}"></i>
          </span>
        </div>
      </button>`
    )
    .join("");

  const app = document.getElementById("booking-app");
  renderStep(`
    <div>
      <div class="text-center mb-8">
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${data.typesHeading}</h2>
        <p class="text-gray-400 text-sm mt-2">${data.typesSubheading}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        ${cards}
      </div>
    </div>
  `);

  app.querySelectorAll(".type-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.type = card.dataset.type;
      renderDates();
    });
  });
}

function renderDates() {
  const data = getBookingData();
  const app = document.getElementById("booking-app");
  const days = generateDays();
  const lang = getCurrentLang();

  const dayCells = days
    .map((d) => {
      const selected = state.date && formatDateKey(state.date) === formatDateKey(d);
      const weekday = d.toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB", { weekday: "short" });
      const dayNum = d.toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB", { day: "numeric" });
      const month = d.toLocaleDateString(lang === "ar" ? "ar-DZ" : "en-GB", { month: "short" });
      return `
      <button data-date="${formatDateKey(d)}" class="date-cell rounded-xl border px-2 py-3 text-center transition-all duration-200 ${
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
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${data.dateHeading}</h2>
        <button id="back-types" class="text-sm text-gray-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1">
          <i class="fas fa-arrow-${lang === "ar" ? "right" : "left"} me-1"></i>${data.backToSlots}
        </button>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5">
        ${dayCells}
      </div>
    </div>
  `);

  app.querySelectorAll(".date-cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      const date = new Date(cell.dataset.date + "T00:00:00");
      state.date = date;
      renderSlots();
    });
  });
  app.querySelector("#back-types").addEventListener("click", () => {
    state.date = null;
    renderTypes();
  });
}

function renderSlots() {
  const data = getBookingData();
  const app = document.getElementById("booking-app");
  const slots = generateSlots(state.date);
  const lang = getCurrentLang();

  const slotCells = slots
    .map((time) => {
      const booked = isSlotBooked(state.date, time);
      const selected = state.time === time;
      return `
      <button data-time="${time}" ${booked ? "disabled" : ""} class="slot-cell rounded-xl border px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
        booked
          ? "border-gray-700/20 text-gray-600 cursor-not-allowed line-through"
          : selected
          ? "bg-amber-500/15 border-amber-500/50 text-amber-300"
          : "bg-white/[0.02] border-gray-700/30 text-gray-300 hover:border-amber-500/40 hover:bg-white/[0.04]"
      }">
        <span dir="ltr">${time}</span>
      </button>`;
    })
    .join("");

  renderStep(`
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${data.slotHeading}</h2>
        <button id="back-dates" class="text-sm text-gray-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1">
          <i class="fas fa-arrow-${lang === "ar" ? "right" : "left"} me-1"></i>${data.backToSlots}
        </button>
      </div>
      <p class="text-gray-400 text-sm mb-6">${formatDate(state.date)}</p>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        ${slotCells}
      </div>
      <p class="text-gray-500 text-xs mt-6 flex items-center gap-2">
        <i class="fas fa-info-circle text-amber-400/60"></i>${data.unavailableNote}
      </p>
    </div>
  `);

  app.querySelectorAll(".slot-cell").forEach((cell) => {
    if (cell.disabled) return;
    cell.addEventListener("click", () => {
      state.time = cell.dataset.time;
      renderForm();
    });
  });
  app.querySelector("#back-dates").addEventListener("click", () => {
    state.time = null;
    renderDates();
  });
}

function renderForm() {
  const data = getBookingData();
  const app = document.getElementById("booking-app");
  const selectedType = data.types.find((t) => t.id === state.type);

  renderStep(`
    <div>
      <div class="text-center mb-8">
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${data.formHeading}</h2>
        <p class="text-gray-400 text-sm mt-2">${data.formSubheading}</p>
      </div>

      <div class="bg-white/[0.02] border border-gray-700/30 rounded-2xl p-5 mb-6">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.typeLabel}</p>
            <p class="text-white font-bold">${selectedType.title}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.dateLabel}</p>
            <p class="text-white font-bold">${formatDate(state.date)}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.timeLabel}</p>
            <p class="text-white font-bold" dir="ltr">${state.time}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.priceLabel}</p>
            <p class="text-amber-400 font-bold">${selectedType.price}</p>
          </div>
        </div>
      </div>

      <form id="booking-form" class="space-y-5 bg-white/[0.02] border border-gray-700/30 rounded-2xl p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-gray-300 text-sm font-bold mb-2">${data.nameLabel}</label>
            <input id="b-name" type="text" required class="w-full bg-slate-800/70 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors" placeholder="${data.namePlaceholder}">
          </div>
          <div>
            <label class="block text-gray-300 text-sm font-bold mb-2">${data.phoneLabel}</label>
            <input id="b-phone" type="tel" required dir="ltr" class="w-full bg-slate-800/70 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-left" placeholder="${data.phonePlaceholder}">
          </div>
        </div>
        <div>
          <label class="block text-gray-300 text-sm font-bold mb-2">${data.emailLabel}</label>
          <input id="b-email" type="email" required dir="ltr" class="w-full bg-slate-800/70 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-left" placeholder="${data.emailPlaceholder}">
        </div>
        <div>
          <label class="block text-gray-300 text-sm font-bold mb-2">${data.detailsLabel}</label>
          <textarea id="b-details" rows="4" required class="w-full bg-slate-800/70 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none" placeholder="${data.detailsPlaceholder}"></textarea>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button id="back-slots" type="button" class="flex-1 border border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 rounded-xl px-6 py-3 text-sm font-bold transition-colors">${data.backToSlots}</button>
          <button type="submit" class="flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 inline-flex items-center justify-center gap-2">
            <i class="fas fa-calendar-check"></i>${data.submitBtn}
          </button>
        </div>
      </form>
    </div>
  `);

  app.querySelector("#back-slots").addEventListener("click", () => {
    state.time = null;
    renderSlots();
  });

  const form = app.querySelector("#booking-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    state.name = app.querySelector("#b-name").value.trim();
    state.phone = app.querySelector("#b-phone").value.trim();
    state.email = app.querySelector("#b-email").value.trim();
    state.details = app.querySelector("#b-details").value.trim();

    if (!state.name || !state.phone || !state.email || !state.details) {
      alert(data.formHeading);
      return;
    }

    state.reference = `BB-${Date.now().toString(36).toUpperCase()}`;
    renderPayment();
  });
}

function renderPayment() {
  const data = getBookingData();
  const selectedType = data.types.find((t) => t.id === state.type);
  const lang = getCurrentLang();
  const contact = getContent().topbar;

  const whatsappUrl = `https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `${lang === "ar" ? "تأكيد الحجز" : "Booking confirmation"} ${state.reference}`
  )}`;

  const steps = data.paymentSteps
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
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${data.paymentHeading}</h2>
        <p class="text-gray-400 text-sm mt-2">${data.paymentSubtitle}</p>
      </div>

      <div class="bg-white/[0.02] border border-gray-700/30 rounded-2xl p-6 mb-6">
        <h3 class="text-white font-bold text-lg font-title mb-4 flex items-center gap-2">
          <i class="fas fa-file-invoice text-amber-400"></i>${data.summaryHeading}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.referenceLabel}</p>
            <p class="text-amber-400 font-bold font-mono" dir="ltr">${state.reference}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.typeLabel}</p>
            <p class="text-white font-bold">${selectedType.title}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.dateLabel}</p>
            <p class="text-white font-bold">${formatDate(state.date)}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.timeLabel}</p>
            <p class="text-white font-bold" dir="ltr">${state.time}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.durationLabel}</p>
            <p class="text-gray-300">${selectedType.duration}</p>
          </div>
          <div>
            <p class="text-gray-500 text-xs mb-1">${data.priceLabel}</p>
            <p class="text-amber-400 font-bold">${selectedType.price}</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/25 rounded-2xl p-6 mb-6">
        <h3 class="text-white font-bold text-lg font-title mb-4 flex items-center gap-2">
          <i class="fas fa-landmark text-amber-400"></i>${data.ccpLabel}
        </h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between items-center bg-slate-800/60 border border-gray-600 rounded-xl px-4 py-3">
            <span class="text-gray-400">${data.ccpHolder}</span>
            <span class="text-white font-bold">${getContent().hero.name}</span>
          </div>
          <div class="flex justify-between items-center bg-slate-800/60 border border-gray-600 rounded-xl px-4 py-3">
            <span class="text-gray-400">${data.ccpLabel}</span>
            <span class="text-white font-bold font-mono" dir="ltr">0000 0000 0000 00</span>
          </div>
          <div class="flex justify-between items-center bg-slate-800/60 border border-amber-500/30 rounded-xl px-4 py-3">
            <span class="text-gray-400">${data.ccpAmount}</span>
            <span class="text-amber-400 font-bold text-lg">${selectedType.price}</span>
          </div>
        </div>
      </div>

      <div class="bg-white/[0.02] border border-gray-700/30 rounded-2xl p-6 mb-6">
        <h3 class="text-white font-bold text-lg font-title mb-4">${data.paymentHeading}</h3>
        <ol class="space-y-3">${steps}</ol>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <a href="${whatsappUrl}" target="_blank" rel="noopener" class="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 shadow-lg shadow-emerald-500/20">
          <i class="fab fa-whatsapp text-lg"></i>${data.contactWhatsApp}
        </a>
        <a href="mailto:${contact.email}?subject=${encodeURIComponent(`${lang === "ar" ? "تأكيد الحجز" : "Booking confirmation"} ${state.reference}`)}" class="flex-1 inline-flex items-center justify-center gap-2 border border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 rounded-xl px-6 py-3 text-sm font-bold transition-colors">
          <i class="fas fa-envelope"></i>${data.contactEmail}
        </a>
      </div>

      <p class="text-center text-gray-500 text-xs flex items-center justify-center gap-2">
        <i class="fas fa-exclamation-circle text-amber-400/60"></i>${data.note}
      </p>
    </div>
  `);

  saveBooking();
}

async function saveBooking() {
  const data = getBookingData();
  const client = getSupabaseClient();
  const booking = {
    reference: state.reference,
    type: state.type,
    date: formatDateKey(state.date),
    time: state.time,
    name: state.name,
    phone: state.phone,
    email: state.email,
    details: state.details,
    status: "pending",
    language: getCurrentLang(),
    created_at: new Date().toISOString(),
  };

  if (!client || !client.from) {
    console.info("[Booking] Supabase not connected. Simulating booking save.");
    return;
  }

  try {
    const { error } = await client.from("bookings").insert([booking]);
    if (error) console.error("[Booking] Supabase insert error:", error);
  } catch (err) {
    console.error("[Booking] Unexpected error:", err);
  }
}

function renderAll() {
  renderTopBar();
  renderNavbar();
  renderFooter();
  renderHeading();
  renderTypes();
}

function init() {
  initTheme();
  initLanguage();
  initPageTransitions();
  renderAll();
  document.addEventListener("click", (event) => {
    const themeBtn = event.target.closest("#theme-toggle");
    if (themeBtn) { toggleTheme(); return; }
    const dropdownBtn = event.target.closest("#lang-dropdown-btn");
    const dropdownMenu = document.getElementById("lang-dropdown-menu");
    if (dropdownBtn && dropdownMenu) {
      dropdownMenu.classList.toggle("hidden");
      const chevron = dropdownBtn.querySelector(".fa-chevron-down");
      if (chevron) chevron.style.transform = dropdownMenu.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)";
      event.stopPropagation();
      return;
    }
    const langBtn = event.target.closest(".lang-btn");
    if (langBtn) {
      const lang = langBtn.dataset.lang;
      if (lang) { setLanguage(lang); renderAll(); }
      return;
    }
    if (dropdownMenu && !dropdownMenu.classList.contains("hidden")) {
      dropdownMenu.classList.add("hidden");
      const chevron = document.querySelector("#lang-dropdown-btn .fa-chevron-down");
      if (chevron) chevron.style.transform = "rotate(0deg)";
    }
  });
}

document.addEventListener("DOMContentLoaded", init);