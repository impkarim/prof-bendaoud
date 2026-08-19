import { initLanguage, getContent, setLanguage, getCurrentLang } from "./services/langService.js";
import { initTheme, toggleTheme } from "./services/themeService.js";
import { initPageTransitions } from "./services/pageTransition.js";
import { renderTopBar, renderNavbar, handleSectionLink, initSectionScrollOnLoad } from "./services/navbarService.js";





function renderHero() {
  const data = getContent().hero;
  const hero = document.getElementById("hero");
  if (!hero) return;

  const statsHTML = data.stats
    .map(
      (s) =>
        `<div class="text-center p-4 bg-white/5 rounded-xl border border-gray-700/50 backdrop-blur-sm">
          <div class="text-3xl lg:text-4xl font-bold text-amber-400 font-title">${s.number}</div>
          <div class="text-xs lg:text-sm text-gray-300 mt-1">${s.label}</div>
        </div>`
    )
    .join("");

  hero.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16 lg:pb-24">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="order-2 lg:order-1">
          <h1 class="text-4xl lg:text-6xl font-bold text-white mt-2 leading-tight font-title"><span class="text-amber-400 font-semibold text-2xl lg:text-3xl tracking-wider">${data.greeting}</span> ${data.name}</h1>
          <div class="mt-4 space-y-1">
            ${data.titles
              .map((t, i) => {
                const icons = ["fa-scroll", "fa-scale-balanced", "fa-building-columns"];
                const [main, suffix] = t.split("|");
                const suffixHTML = suffix
                  ? ` <span class="text-xs lg:text-sm text-amber-400/80 font-medium align-middle">${suffix}</span>`
                  : "";
                return `<p class="text-gray-300 text-base lg:text-lg"><i class="fas ${icons[i] || "fa-star"} text-amber-500 me-2 text-xs w-4 text-center"></i>${main}${suffixHTML}</p>`;
              })
              .join("")}
          </div>
          <div class="mt-4 flex items-start gap-3">
            <span class="text-amber-400/60 text-xl leading-none mt-0.5 drop-shadow-[0_0_6px_rgba(217,119,6,0.3)]">\u2605</span>
            <div>
              <span class="text-sm lg:text-base font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)] tracking-[0.15em] uppercase">${getCurrentLang() === "ar" ? "تكريم رئاسي" : "PRESIDENTIAL HONOR"}</span>
              <p class="text-white text-base lg:text-lg font-title leading-relaxed mt-1 drop-shadow-[0_0_4px_rgba(255,255,255,0.08)]">${data.honor}</p>
            </div>
          </div>
          <div class="mt-8 flex flex-wrap gap-4">
            <a href="./" data-section="timeline" class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-3 rounded-lg transition-colors duration-200">
              ${data.cta}
            </a>
            <a href="booking/" class="border border-gray-500 hover:border-amber-500 text-gray-200 hover:text-amber-400 px-6 py-3 rounded-lg transition-colors duration-200">
              ${data.secondaryCta}
            </a>
          </div>
        </div>
        <div class="order-1 lg:order-2 flex justify-center mt-8 lg:mt-12">
          <div class="flex flex-col items-center">
            <div class="relative">
              <div class="absolute -inset-3 rounded-full border border-amber-500/20"></div>
              <div class="absolute -inset-[6px] rounded-full border border-amber-500/40"></div>
              <div class="relative w-64 h-64 lg:w-80 lg:h-80">
                <div class="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/15 via-slate-700/50 to-slate-800/70 border-2 border-amber-500/30 shadow-xl shadow-amber-500/10 overflow-hidden flex items-center justify-center">
                  <img id="profile-img" src="assets/images/profile/profile.png" alt="${data.name}" width="500" height="532" fetchpriority="high"
                    class="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500"
                    onerror="this.remove()"
                    onload="this.style.opacity='1'">
                </div>
              </div>
            </div>
            <div class="mt-6 text-center">
              <h2 class="text-xl lg:text-2xl font-bold text-white font-title">${data.name}</h2>
              <p class="text-amber-400/80 text-sm lg:text-base font-light tracking-wide mt-1">${data.titles[0]}</p>
              <div class="mt-3 flex items-center justify-center gap-2">
                <span class="w-8 h-px bg-amber-500/40"></span>
                <i class="fas fa-gavel text-amber-500/30 text-xs"></i>
                <span class="w-8 h-px bg-amber-500/40"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${statsHTML}
      </div>
    </div>
  `;
}

function renderVision() {
  const data = getContent().vision;
  const section = document.getElementById("vision");
  if (!section) return;

  const cardsHTML = data.cards
    .map(
      (card) =>
        `<div class="bg-white/5 border border-gray-700/50 rounded-xl p-6 lg:p-8 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
          <div class="w-14 h-14 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
            <i class="fas ${card.icon} text-2xl text-amber-400"></i>
          </div>
          <h3 class="text-xl lg:text-2xl font-bold text-white mb-3 font-title">${card.title}</h3>
          <p class="text-gray-400 leading-relaxed text-sm lg:text-base">${card.text}</p>
        </div>`
    )
    .join("");

  const subtitle =
    getCurrentLang() === "ar"
      ? ""
      : `<p class="text-gray-400 text-center max-w-2xl mx-auto">${data.subtitle}</p>`;

  section.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div class="text-center mb-12">
        <h2 class="text-3xl lg:text-4xl font-bold text-white font-title">${data.heading}</h2>
        ${subtitle}
      </div>
      <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
        ${cardsHTML}
      </div>
    </div>
  `;
}

function renderTimeline() {
  const data = getContent().timeline;
  const section = document.getElementById("timeline");
  if (!section) return;

  const eventsHTML = data.events
    .map(
      (event, index) =>
        `<div class="relative flex gap-6 pb-12 group">
          <div class="flex flex-col items-center">
            <div class="w-5 h-5 rounded-full bg-amber-500 border-4 border-slate-900 z-10 group-hover:scale-125 transition-transform duration-200"></div>
            <div class="w-0.5 flex-1 bg-gradient-to-b from-amber-500/60 to-transparent mt-2 ${
              index === data.events.length - 1 ? "hidden" : ""
            }"></div>
          </div>
          <div class="flex-1 pb-4">
            <span class="inline-block text-amber-400 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-full mb-2">${event.year}</span>
            <h3 class="text-xl lg:text-2xl font-bold text-white font-title">${event.title}</h3>
            <p class="text-gray-400 mt-2 leading-relaxed text-sm lg:text-base">${event.description}</p>
          </div>
        </div>`
    )
    .join("");

  section.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div class="text-center mb-12">
        <h2 class="text-3xl lg:text-4xl font-bold text-white font-title">${data.heading}</h2>
        <p class="text-gray-400 mt-2">${data.subtitle}</p>
      </div>
      <div class="max-w-3xl mx-auto">
        ${eventsHTML}
      </div>
      <div class="text-center mt-8">
          <a href="career/" class="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors group">
          <span>${getCurrentLang() === "ar" ? "عرض المسار المهني الكامل" : "View full career"}</span>
          <i class="fas ${getCurrentLang() === "ar" ? "fa-arrow-left" : "fa-arrow-right"} text-xs group-hover:translate-x-1 transition-transform"></i>
        </a>
      </div>
    </div>
  `;
}

function renderCertificates() {
  const data = getContent().certificates;
  const section = document.getElementById("certificates");
  if (!section) return;

  const typeColors = {
    ar: { "أكاديمي": "bg-blue-500/10 text-blue-400", "دكتوراه": "bg-purple-500/10 text-purple-400", "ماجستير": "bg-emerald-500/10 text-emerald-400", "إجازة": "bg-cyan-500/10 text-cyan-400", "مهني": "bg-amber-500/10 text-amber-400", "لغات": "bg-rose-500/10 text-rose-400" },
    en: { "Academic": "bg-blue-500/10 text-blue-400", "Doctorate": "bg-purple-500/10 text-purple-400", "Master": "bg-emerald-500/10 text-emerald-400", "Bachelor": "bg-cyan-500/10 text-cyan-400", "Professional": "bg-amber-500/10 text-amber-400", "Languages": "bg-rose-500/10 text-rose-400" },
  };

  const lang = getCurrentLang();
  const colors = typeColors[lang] || typeColors.ar;

  const itemsHTML = data.items
    .map(
      (item) =>
        `<div class="bg-white/5 border border-gray-700/50 rounded-xl p-5 hover:border-amber-500/50 transition-all duration-200 backdrop-blur-sm flex items-start gap-4">
          <div class="w-12 h-12 ${colors[item.type] || "bg-amber-500/10 text-amber-400"} rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas ${item.icon} text-lg"></i>
          </div>
          <div class="flex-1 min-w-0">
            <span class="inline-block text-xs font-semibold ${colors[item.type] || "text-amber-400"} px-2 py-0.5 rounded-full">${item.type}</span>
            <h3 class="text-base lg:text-lg font-bold text-white mt-1 font-title">${item.title}</h3>
            ${item.org ? `<p class="text-gray-400 text-sm mt-1">${item.org}</p>` : ""}
            ${item.year ? `<p class="text-amber-300/70 text-xs mt-1"><i class="fas fa-star text-amber-500 me-1"></i>${item.year}</p>` : ""}
          </div>
        </div>`
    )
    .join("");

  section.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div class="text-center mb-12">
        <h2 class="text-3xl lg:text-4xl font-bold text-white font-title">${data.heading}</h2>
        <p class="text-gray-400 mt-2">${data.subtitle}</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        ${itemsHTML}
      </div>
    </div>
  `;
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
    </div>
  `;
}

function renderAll() {
  renderTopBar();
  renderNavbar();
  renderHero();
  renderVision();
  renderTimeline();
  renderCertificates();
  renderFooter();
}

function initializeLanguageSwitcher() {
  document.addEventListener("click", (event) => {
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
      if (lang) {
        setLanguage(lang);
        renderAll();
      }
      return;
    }

    if (dropdownMenu && !dropdownMenu.classList.contains("hidden")) {
      dropdownMenu.classList.add("hidden");
      const chevron = document.querySelector("#lang-dropdown-btn .fa-chevron-down");
      if (chevron) chevron.style.transform = "rotate(0deg)";
    }
  });
}

function init() {
  initTheme();
  initLanguage();
  initPageTransitions();
  renderAll();
  initializeLanguageSwitcher();
  document.querySelectorAll("[data-section]").forEach((link) => {
    link.addEventListener("click", (e) => {
      handleSectionLink(link.dataset.section || "", e);
    });
  });
  initSectionScrollOnLoad();
  document.addEventListener("click", (event) => {
    const themeBtn = event.target.closest("#theme-toggle");
    if (themeBtn) { toggleTheme(); return; }
  });
}

document.addEventListener("DOMContentLoaded", init);
