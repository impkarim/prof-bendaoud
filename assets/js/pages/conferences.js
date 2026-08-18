import { initLanguage, getContent, setLanguage, getCurrentLang } from "../services/langService.js";
import { initTheme, toggleTheme } from "../services/themeService.js";
import { initPageTransitions } from "../services/pageTransition.js";
import { renderTopBar, renderNavbar } from "../services/navbarService.js";
import { conferences as conferencesAr } from "../data/conferences-ar.js";
import { conferences as conferencesEn } from "../data/conferences-en.js";





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

function getConferences() {
  const lang = getCurrentLang();
  if (lang === "ar") return conferencesAr;
  return conferencesEn;
}

function extractYear(dateStr) {
  const m = dateStr.match(/\b(\d{4})\b/);
  return m ? parseInt(m[1]) : 0;
}

function getMonthOrder(dateStr) {
  const lang = getCurrentLang();
  const m = dateStr.match(/\b(\d{1,2})\s*(?:\u2013|-)?\s*\d{0,2}?\s*/);
  const firstNum = m ? parseInt(m[1]) : 0;
  const year = extractYear(dateStr);
  let month = 1;
  if (lang === "ar") {
    const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    months.forEach((mn, i) => { if (dateStr.includes(mn)) month = i + 1; });
  } else {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    months.forEach((mn, i) => { if (dateStr.toLowerCase().includes(mn)) month = i + 1; });
  }
  return year * 100 + (month < 10 ? "0" : "") + month + (firstNum < 10 ? "0" : "") + firstNum;
}

let currentType = "national";

function renderConferences(type) {
  currentType = type || currentType;
  const container = document.getElementById("conferences-list");
  if (!container) return;

  const allConferences = getConferences();
  const filtered = allConferences.filter(c => c.type === currentType);

  const countDisplay = document.getElementById("count-display");
  if (countDisplay) {
    countDisplay.textContent = filtered.length;
    const lang = getCurrentLang();
    document.getElementById("count-label").textContent = lang === "ar" ? "ملتقى علمي" : "conferences";
  }

  const groups = {};
  filtered.forEach(c => {
    const year = extractYear(c.date);
    if (!groups[year]) groups[year] = [];
    groups[year].push(c);
  });

  const years = Object.keys(groups).filter(y => y > 0).sort((a, b) => b - a);

  if (years.length === 0) {
    container.innerHTML = `<div class="text-center py-20 text-gray-500"><i class="fas fa-inbox text-4xl mb-4 opacity-30"></i><p>No entries found</p></div>`;
    return;
  }

  let html = "";

  years.forEach((year, yi) => {
    const entries = groups[year].sort((a, b) => getMonthOrder(b.date) - getMonthOrder(a.date));

    html += `
      <div class="mb-12 last:mb-0">
        <div class="year-divider flex items-center gap-4 mb-8">
          <span class="text-5xl lg:text-7xl font-bold text-amber-500/15 font-title leading-none tracking-tighter select-none">${year}</span>
          <span class="h-px flex-1 bg-gradient-to-l from-amber-500/30 via-amber-500/10 to-transparent"></span>
          <span class="text-xs text-gray-600 font-medium tracking-widest uppercase">${yi === 0 ? "" : ""}</span>
        </div>
        <div class="relative pr-10">
          <div class="timeline-line"></div>
    `;

    entries.forEach((c, i) => {
      const icon = currentType === "national" ? "landmark" : "globe";
      html += `
        <div class="conf-card relative bg-white/[0.02] border border-gray-800/60 rounded-2xl p-5 lg:p-6 mb-4 last:mb-0 hover:bg-white/[0.04] transition-all duration-300">
          <div class="timeline-dot"></div>
          <div class="flex items-start gap-4 lg:gap-6">
            <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/10 flex items-center justify-center text-amber-400/80 mt-0.5">
              <i class="fas fa-${icon} text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg lg:text-xl font-bold text-white font-title leading-snug">${c.title}</h3>
              <p class="text-amber-400/70 text-sm lg:text-base mt-2 font-medium">${c.event}</p>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs lg:text-sm text-gray-500">
                <span><i class="fas fa-map-pin ml-1 text-gray-600"></i>${c.location}</span>
                <span><i class="fas fa-calendar ml-1 text-gray-600"></i>${c.date}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderContent() {
  const data = getContent().conferences;
  const lang = getCurrentLang();
  document.getElementById("page-heading").textContent = data.heading;
  document.getElementById("page-subtitle").textContent = data.subtitle;
  document.getElementById("back-label").textContent = data.backLabel;
  document.getElementById("page-badge").textContent = data.subtitle;

  const backLink = document.getElementById("back-link");
  const icon = backLink.querySelector("i");
  if (lang === "ar") {
    icon.className = "fas fa-arrow-right ml-1";
  } else {
    icon.className = "fas fa-arrow-left mr-1";
  }

  document.getElementById("btn-national").textContent = data.nationalLabel;
  document.getElementById("btn-international").textContent = data.internationalLabel;
}

function renderAll() {
  renderTopBar();
  renderNavbar();
  renderFooter();
  renderContent();
  renderConferences(currentType);
}

function init() {
  initPageTransitions();
  initLanguage();
  renderAll();

  function activateTab(active, inactive) {
    const activeEl = document.getElementById(active);
    const inactiveEl = document.getElementById(inactive);
    if (!activeEl || !inactiveEl) return;
    activeEl.className = "tab-btn active flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 bg-amber-500/20 text-amber-400 border border-amber-500/25 shadow-sm shadow-amber-500/5";
    inactiveEl.className = "tab-btn flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 bg-transparent text-gray-400 border border-transparent hover:text-gray-200 hover:bg-white/5";
  }

  document.getElementById("btn-national")?.addEventListener("click", () => {
    if (currentType === "national") return;
    activateTab("btn-national", "btn-international");
    currentType = "national";
    renderConferences("national");
  });

  document.getElementById("btn-international")?.addEventListener("click", () => {
    if (currentType === "international") return;
    activateTab("btn-international", "btn-national");
    currentType = "international";
    renderConferences("international");
  });

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
