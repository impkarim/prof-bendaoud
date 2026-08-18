import { initLanguage, getContent, setLanguage, getCurrentLang } from "../services/langService.js";
import { initTheme, toggleTheme } from "../services/themeService.js";
import { initPageTransitions } from "../services/pageTransition.js";
import { renderTopBar, renderNavbar } from "../services/navbarService.js";
import { getSupabaseClient } from "../config/supabase.js";
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
  document.getElementById("page-badge").textContent = data.badgeLabel;
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

function renderStepsIndicator(current) {
  const data = getBookingData();
  const steps = [
    { label: data.step1Label, icon: "fa-file-signature" },
    { label: data.step2Label, icon: "fa-credit-card" },
  ];
  return `
    <div class="flex items-center justify-center gap-2 sm:gap-4 mb-10">
      ${steps
        .map((s, i) => {
          const isActive = i === current;
          const isDone = i < current;
          return `
            <div class="flex items-center gap-2 sm:gap-4">
              <div class="flex items-center gap-2">
                <span class="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                  isDone
                    ? "bg-amber-500 text-slate-900"
                    : isActive
                    ? "bg-amber-500/15 border border-amber-500/50 text-amber-400"
                    : "bg-white/5 border border-gray-700/50 text-gray-500"
                }">
                  <i class="fas ${isDone ? "fa-check" : s.icon}"></i>
                </span>
                <span class="text-sm font-bold ${isActive || isDone ? "text-amber-400" : "text-gray-500"}">${s.label}</span>
              </div>
              ${i < steps.length - 1 ? `<span class="w-8 sm:w-16 h-px ${isDone ? "bg-amber-500/40" : "bg-gray-700/50"}"></span>` : ""}
            </div>`;
        })
        .join("")}
    </div>
  `;
}

function renderContactSidebar() {
  const data = getBookingData();
  const contact = getContent().contact.info;
  return `
    <div class="bg-white/5 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
      <h3 class="text-white font-bold text-lg mb-5 font-title flex items-center gap-2">
        <i class="fas fa-address-card text-amber-400"></i>${data.contactHeading}
      </h3>
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm flex-shrink-0">
            <i class="fas fa-envelope"></i>
          </span>
          <span class="text-gray-300 text-sm" dir="ltr">${contact.email}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm flex-shrink-0">
            <i class="fas fa-phone"></i>
          </span>
          <span class="text-gray-300 text-sm"><bdi dir="ltr">${contact.phone}</bdi></span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm flex-shrink-0">
            <i class="fas fa-map-marker-alt"></i>
          </span>
          <span class="text-gray-300 text-sm">${contact.address}</span>
        </div>
      </div>
    </div>`;
}

const inputClass =
  "w-full bg-white/5 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors duration-200";

function priceColorClass(price) {
  return price === "مجاناً" || price === "Free" ? "text-emerald-400" : "text-amber-400";
}

function renderForm() {
  const data = getBookingData();
  const app = document.getElementById("booking-app");
  const selectedType = data.types.find((t) => t.id === state.type) || data.types[0];
  if (!state.type) state.type = selectedType.id;

  const typeCards = data.types
    .map(
      (t) => `
      <button type="button" data-type="${t.id}" class="b-type-option w-full flex items-start gap-3 p-4 text-right transition-colors border-b border-gray-700/50 last:border-0 hover:bg-white/5 ${
        t.id === state.type ? "bg-white/5" : ""
      }">
        <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <i class="fas ${t.icon}"></i>
        </span>
        <span class="flex-1">
          <span class="flex items-center justify-between gap-2">
            <span class="block font-bold text-white text-sm">${t.title}</span>
            <span class="${priceColorClass(t.price)} font-bold text-sm flex-shrink-0">${t.price}</span>
          </span>
          <span class="block text-gray-400 text-xs leading-relaxed mt-1">${t.desc}</span>
          <span class="inline-flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <i class="fas fa-clock text-amber-400/70"></i>${t.duration}
          </span>
        </span>
        <span class="b-type-check flex-shrink-0 w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center text-transparent mt-0.5 ${
          t.id === state.type ? "!bg-amber-500 !border-amber-500 !text-slate-900" : ""
        }">
          <i class="fas fa-check text-[10px]"></i>
        </span>
      </button>`
    )
    .join("");

  const howSteps = data.howSteps
    .map(
      (s, i) => `
      <div class="flex items-start gap-3">
        <span class="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm">
          <i class="fas ${s.icon}"></i>
        </span>
        <div>
          <p class="text-white font-bold text-sm mb-1">${i + 1}. ${s.title}</p>
          <p class="text-gray-400 text-xs leading-relaxed">${s.desc}</p>
        </div>
      </div>`
    )
    .join("");

  renderStep(`
    <div class="max-w-5xl mx-auto">
      ${renderStepsIndicator(0)}

      <div class="grid lg:grid-cols-3 gap-8 items-start">
        <div class="lg:col-span-2">
          <div class="bg-white/5 border border-gray-700/50 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
            <h2 class="text-xl lg:text-2xl font-bold text-white font-title mb-6 flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <i class="fas fa-file-signature"></i>
              </span>
              ${data.formHeading}
            </h2>

            <form id="booking-form" class="space-y-5">
              <div>
                <label class="block text-gray-300 text-sm font-bold mb-2">${data.typeLabel}</label>
                <div class="relative">
                  <button type="button" id="b-type-trigger" class="w-full bg-white/5 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors duration-200 flex items-center justify-between gap-3">
                    <span class="flex items-center gap-3 min-w-0">
                      <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <i class="fas ${selectedType.icon}"></i>
                      </span>
                      <span class="text-left min-w-0">
                        <span id="b-type-title" class="block text-white font-bold text-sm truncate">${selectedType.title}</span>
                        <span id="b-type-duration" class="block text-gray-500 text-xs mt-0.5"><i class="fas fa-clock text-amber-400/70 me-1"></i>${selectedType.duration}</span>
                      </span>
                    </span>
                    <span class="flex items-center gap-3 flex-shrink-0">
                      <span id="b-type-price" class="${priceColorClass(selectedType.price)} font-bold">${selectedType.price}</span>
                      <i id="b-type-chevron" class="fas fa-chevron-down text-gray-500 transition-transform duration-200"></i>
                    </span>
                  </button>
                  <div id="b-type-menu" class="hidden absolute top-full left-0 right-0 mt-2 z-20 bg-slate-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden max-h-80 overflow-y-auto">
                    ${typeCards}
                  </div>
                </div>
                <input type="hidden" id="b-type-value" value="${state.type}">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-gray-300 text-sm font-bold mb-2">${data.nameLabel}</label>
                  <input id="b-name" type="text" required class="${inputClass}" placeholder="${data.namePlaceholder}">
                </div>
                <div>
                  <label class="block text-gray-300 text-sm font-bold mb-2">${data.phoneLabel}</label>
                  <input id="b-phone" type="tel" required dir="ltr" class="${inputClass} text-left" placeholder="${data.phonePlaceholder}">
                </div>
              </div>

              <div>
                <label class="block text-gray-300 text-sm font-bold mb-2">${data.emailLabel}</label>
                <input id="b-email" type="email" required dir="ltr" class="${inputClass} text-left" placeholder="${data.emailPlaceholder}">
              </div>

              <div>
                <label class="block text-gray-300 text-sm font-bold mb-2">${data.detailsLabel}</label>
                <textarea id="b-details" rows="5" required class="${inputClass} resize-none" placeholder="${data.detailsPlaceholder}"></textarea>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" class="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 hover:text-slate-900 font-bold rounded-xl px-6 py-3 text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30">
                  <i class="fas fa-paper-plane"></i>${data.submitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside class="space-y-6">
          <div class="bg-white/5 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <h3 class="text-white font-bold text-lg font-title mb-5 flex items-center gap-2">
              <i class="fas fa-list-check text-amber-400"></i>${data.howHeading}
            </h3>
            <div class="space-y-5">${howSteps}</div>
          </div>
          ${renderContactSidebar()}
        </aside>
      </div>
    </div>
  `);

  const typeTrigger = app.querySelector("#b-type-trigger");
  const typeMenu = app.querySelector("#b-type-menu");
  const typeValue = app.querySelector("#b-type-value");
  const chevron = app.querySelector("#b-type-chevron");

  function selectType(id) {
    const t = data.types.find((x) => x.id === id);
    if (!t) return;
    state.type = id;
    typeValue.value = id;
    app.querySelector("#b-type-title").textContent = t.title;
    app.querySelector("#b-type-duration").innerHTML = `<i class="fas fa-clock text-amber-400/70 me-1"></i>${t.duration}`;
    const priceEl = app.querySelector("#b-type-price");
    priceEl.textContent = t.price;
    priceEl.className = `${priceColorClass(t.price)} font-bold`;
    typeTrigger.querySelector("span.flex-shrink-0 i").className = `fas ${t.icon}`;
    typeMenu.querySelectorAll(".b-type-option").forEach((opt) => {
      const active = opt.dataset.type === id;
      opt.classList.toggle("bg-white/5", active);
      const check = opt.querySelector(".b-type-check");
      if (check) {
        check.classList.toggle("!bg-amber-500", active);
        check.classList.toggle("!border-amber-500", active);
        check.classList.toggle("!text-slate-900", active);
        check.classList.toggle("text-transparent", !active);
      }
    });
    closeMenu();
  }

  function closeMenu() {
    typeMenu.classList.add("hidden");
    chevron.style.transform = "rotate(0deg)";
  }

  function toggleMenu() {
    typeMenu.classList.toggle("hidden");
    chevron.style.transform = typeMenu.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)";
  }

  typeTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  typeMenu.querySelectorAll(".b-type-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      selectType(opt.dataset.type);
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#b-type-trigger") && !e.target.closest("#b-type-menu")) {
      closeMenu();
    }
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
    <div class="max-w-3xl mx-auto">
      ${renderStepsIndicator(1)}

      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl mb-4">
          <i class="fas fa-check"></i>
        </div>
        <h2 class="text-2xl lg:text-3xl font-bold text-white font-title">${data.paymentHeading}</h2>
        <p class="text-gray-400 text-sm mt-2 max-w-xl mx-auto">${data.paymentSubtitle}</p>
      </div>

      <div class="bg-white/5 border border-gray-700/50 rounded-2xl p-6 lg:p-8 backdrop-blur-sm mb-6">
        <h3 class="text-white font-bold text-lg font-title mb-5 flex items-center gap-2">
          <i class="fas fa-file-invoice text-amber-400"></i>${data.summaryHeading}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div class="bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3">
            <p class="text-gray-500 text-xs mb-1">${data.referenceLabel}</p>
            <p class="text-amber-400 font-bold font-mono" dir="ltr">${state.reference}</p>
          </div>
          <div class="bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3">
            <p class="text-gray-500 text-xs mb-1">${data.typeLabel}</p>
            <p class="text-white font-bold">${selectedType.title}</p>
          </div>
          <div class="bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3">
            <p class="text-gray-500 text-xs mb-1">${data.durationLabel}</p>
            <p class="text-gray-300">${selectedType.duration}</p>
          </div>
          <div class="bg-white/5 border border-amber-500/30 rounded-xl px-4 py-3">
            <p class="text-gray-500 text-xs mb-1">${data.priceLabel}</p>
            <p class="${priceColorClass(selectedType.price)} font-bold text-lg">${selectedType.price}</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/25 rounded-2xl p-6 lg:p-8 mb-6">
        <h3 class="text-white font-bold text-lg font-title mb-5 flex items-center gap-2">
          <i class="fas fa-landmark text-amber-400"></i>${data.ccpLabel}
        </h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between items-center bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3">
            <span class="text-gray-400">${data.ccpHolder}</span>
            <span class="text-white font-bold">${getContent().hero.name}</span>
          </div>
          <div class="flex justify-between items-center bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3">
            <span class="text-gray-400">${data.ccpLabel}</span>
            <span class="text-white font-bold font-mono" dir="ltr">0000 0000 0000 00</span>
          </div>
          <div class="flex justify-between items-center bg-white/5 border border-amber-500/30 rounded-xl px-4 py-3">
            <span class="text-gray-400">${data.ccpAmount}</span>
            <span class="text-amber-400 font-bold text-lg">${selectedType.price}</span>
          </div>
        </div>
      </div>

      <div class="bg-white/5 border border-gray-700/50 rounded-2xl p-6 lg:p-8 backdrop-blur-sm mb-6">
        <h3 class="text-white font-bold text-lg font-title mb-4 flex items-center gap-2">
          <i class="fas fa-info-circle text-amber-400"></i>${data.appointmentNoteHeading}
        </h3>
        <p class="text-gray-300 text-sm leading-relaxed mb-5">${data.appointmentNote}</p>
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
    sendBookingEmail(booking, data);
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

    sendBookingEmail(booking, data);
    return { success: true };
  } catch (err) {
    console.error("[Booking] Unexpected error:", err);
    return { success: false };
  }
}

const WEB3FORMS_ACCESS_KEY = "f9b0d32f-2251-42b8-9e90-e42290f87189";

function sendBookingEmail(booking, data) {
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.startsWith("YOUR_")) {
    console.warn("[Booking] Web3Forms access key not configured. Skipping email.");
    return;
  }

  const selectedType = data.types.find((t) => t.id === booking.type);
  const lang = getCurrentLang();

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `${lang === "ar" ? "طلب استشارة جديد" : "New Consultation Request"} ${booking.reference}`,
    from_name: booking.name,
    email: booking.email,
    [lang === "ar" ? "رقم الحجز" : "Reference"]: booking.reference,
    [lang === "ar" ? "الاسم" : "Name"]: booking.name,
    [lang === "ar" ? "الهاتف" : "Phone"]: booking.phone,
    [lang === "ar" ? "البريد" : "Email"]: booking.email,
    [lang === "ar" ? "نوع الاستشارة" : "Consultation"]: selectedType ? selectedType.title : booking.type,
    [lang === "ar" ? "المبلغ" : "Amount"]: selectedType ? selectedType.price : "",
    [lang === "ar" ? "وصف الاستشارة" : "Details"]: booking.details,
    botcheck: "",
  };

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        console.info("[Booking] Request email sent to contact@brahimbendaoud.com");
      } else {
        console.warn("[Booking] Web3Forms result:", result.message || result);
      }
    })
    .catch((err) => {
      console.error("[Booking] Web3Forms error:", err);
    });
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