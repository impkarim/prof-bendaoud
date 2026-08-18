import { initLanguage, getContent, setLanguage, getCurrentLang } from "../services/langService.js";
import { initTheme, toggleTheme } from "../services/themeService.js";
import { initPageTransitions } from "../services/pageTransition.js";
import { renderTopBar, renderNavbar } from "../services/navbarService.js";
import { getSupabaseClient } from "../config/supabase.js";
import { sendTelegramMessage } from "../config/telegram.js";
import { booking as bookingAr } from "../data/booking-ar.js";
import { booking as bookingEn } from "../data/booking-en.js";

let state = {
  type: null,
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

function renderForm() {
  const data = getBookingData();
  const app = document.getElementById("booking-app");
  const selectedType = data.types.find((t) => t.id === state.type) || data.types[0];
  if (!state.type) state.type = selectedType.id;

  const typeOptions = data.types
    .map(
      (t) => `
      <option value="${t.id}" ${t.id === state.type ? "selected" : ""}>${t.title} — ${t.price}</option>`
    )
    .join("");

  renderStep(`
    <div>
      <div class="text-center mb-8">
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${data.formHeading}</h2>
        <p class="text-gray-400 text-sm mt-2">${data.formSubheading}</p>
      </div>

      <form id="booking-form" class="space-y-5 bg-white/[0.02] border border-gray-700/30 rounded-2xl p-6">
        <div>
          <label class="block text-gray-300 text-sm font-bold mb-2">${data.typeLabel}</label>
          <select id="b-type" class="w-full bg-slate-800/70 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors">
            ${typeOptions}
          </select>
          <div id="b-type-info" class="mt-3 flex items-center justify-between bg-slate-800/50 border border-gray-600 rounded-xl px-4 py-3 text-sm">
            <span class="text-gray-400 flex items-center gap-2">
              <i class="fas fa-clock text-amber-400/70"></i><span id="b-duration">${selectedType.duration}</span>
            </span>
            <span class="text-amber-400 font-bold text-lg" id="b-price">${selectedType.price}</span>
          </div>
        </div>
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
          <button type="submit" class="flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 inline-flex items-center justify-center gap-2">
            <i class="fas fa-paper-plane"></i>${data.submitBtn}
          </button>
        </div>
      </form>
    </div>
  `);

  const typeSelect = app.querySelector("#b-type");
  typeSelect.addEventListener("change", () => {
    state.type = typeSelect.value;
    const t = data.types.find((x) => x.id === state.type);
    app.querySelector("#b-duration").textContent = t.duration;
    app.querySelector("#b-price").textContent = t.price;
  });

  const form = app.querySelector("#booking-form");
  const submitBtn = form.querySelector("button[type='submit']");
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

    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>${data.submittingBtn}`;

    const result = await bookAppointment(data);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;

    if (!result.success) {
      alert(data.bookingErrorMsg);
      return;
    }

    renderPayment();
  });
}

function renderPayment() {
  const data = getBookingData();
  const selectedType = data.types.find((t) => t.id === state.type);
  const lang = getCurrentLang();
  const contact = getContent().topbar;

  const whatsappUrl = `https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `${lang === "ar" ? "طلب استشارة" : "Consultation request"} ${state.reference}\n${lang === "ar" ? "رقم الحجز" : "Reference"}: ${state.reference}\n${lang === "ar" ? "الاسم" : "Name"}: ${state.name}\n${lang === "ar" ? "نوع الاستشارة" : "Consultation"}: ${selectedType.title}`
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
        <h3 class="text-white font-bold text-lg font-title mb-4">${data.appointmentNoteHeading}</h3>
        <p class="text-gray-300 text-sm leading-relaxed mb-4">${data.appointmentNote}</p>
        <ol class="space-y-3">${steps}</ol>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <a href="${whatsappUrl}" target="_blank" rel="noopener" class="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 shadow-lg shadow-emerald-500/20">
          <i class="fab fa-whatsapp text-lg"></i>${data.contactWhatsApp}
        </a>
        <a href="mailto:${contact.email}?subject=${encodeURIComponent(`${lang === "ar" ? "طلب استشارة" : "Consultation request"} ${state.reference}`)}" class="flex-1 inline-flex items-center justify-center gap-2 border border-gray-600 text-gray-300 hover:border-amber-500 hover:text-amber-400 rounded-xl px-6 py-3 text-sm font-bold transition-colors">
          <i class="fas fa-envelope"></i>${data.contactEmail}
        </a>
      </div>

      <p class="text-center text-gray-500 text-xs flex items-center justify-center gap-2">
        <i class="fas fa-exclamation-circle text-amber-400/60"></i>${data.note}
      </p>
    </div>
  `);
}

async function bookAppointment(data) {
  const client = getSupabaseClient();
  const booking = {
    reference: state.reference,
    type: state.type,
    date: "",
    time: "",
    name: state.name,
    phone: state.phone,
    email: state.email,
    details: state.details,
    status: "pending",
    language: getCurrentLang(),
  };

  if (!client || !client.rpc) {
    console.info("[Booking] Supabase not connected. Simulating successful booking.");
    sendTelegramNotification(booking, data);
    return { success: true };
  }

  try {
    const { data: result, error } = await client.rpc("create_booking", {
      p_reference: booking.reference,
      p_type: booking.type,
      p_date: booking.date,
      p_time: booking.time,
      p_name: booking.name,
      p_phone: booking.phone,
      p_email: booking.email,
      p_details: booking.details,
      p_language: booking.language,
    });

    if (error) {
      console.error("[Booking] create_booking error:", error);
      return { success: false };
    }

    if (!result || result.success === false) {
      return { success: false };
    }

    sendTelegramNotification(booking, data);
    return { success: true };
  } catch (err) {
    console.error("[Booking] Unexpected error:", err);
    return { success: false };
  }
}

function sendTelegramNotification(booking, data) {
  const selectedType = data.types.find((t) => t.id === booking.type);
  const lang = getCurrentLang();

  const lines = [
    "📌 <b>" + (lang === "ar" ? "طلب استشارة جديد" : "New Consultation Request") + "</b>",
    "━━━━━━━━━━━━━━━",
    "🆔 " + (lang === "ar" ? "رقم الحجز" : "Reference") + ": <code>" + booking.reference + "</code>",
    "👤 " + (lang === "ar" ? "الاسم" : "Name") + ": " + booking.name,
    "📞 " + (lang === "ar" ? "الهاتف" : "Phone") + ": " + booking.phone,
    "✉️ " + (lang === "ar" ? "البريد" : "Email") + ": " + booking.email,
    "⚖️ " + (lang === "ar" ? "نوع الاستشارة" : "Consultation") + ": " + (selectedType ? selectedType.title : booking.type),
    "💵 " + (lang === "ar" ? "المبلغ" : "Amount") + ": " + (selectedType ? selectedType.price : ""),
    "📝 " + (lang === "ar" ? "وصف الاستشارة" : "Details") + ": " + booking.details,
    "",
    "🕐 " + (lang === "ar" ? "الموعد: يُحدد بعد استلام وصل الدفع" : "Appointment: set after receiving payment receipt"),
  ];

  sendTelegramMessage(lines.join("\n"));
}

function renderAll() {
  renderTopBar();
  renderNavbar();
  renderFooter();
  renderHeading();
  renderForm();
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