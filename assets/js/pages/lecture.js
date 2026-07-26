import { initLanguage, getContent, setLanguage, getCurrentLang } from "../services/langService.js";
import { initTheme, toggleTheme } from "../services/themeService.js";
import { initPageTransitions } from "../services/pageTransition.js";

function renderTopBar() {
  const data = getContent().topbar;
  const topbar = document.getElementById("topbar");
  if (!topbar) return;

  topbar.innerHTML = `
    <div class="fixed top-0 left-0 right-0 z-50 bg-slate-800/90 border-b border-gray-700/50 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-9">
          <div class="flex items-center gap-4">
            <span class="text-gray-400"><i class="fas fa-envelope ml-1.5 text-amber-400"></i>${data.email}</span>
            <span class="text-gray-400 hidden sm:inline"><i class="fas fa-phone-alt ml-1.5 text-amber-400"></i>${data.phone}</span>
          </div>
          <div class="flex items-center gap-3">
            ${data.social.map(s => `<a href="${s.url}" target="_blank" rel="noopener" title="${s.title}" class="text-gray-400 hover:text-amber-400 transition-colors"><i class="${s.icon}"></i></a>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderNavbar() {
  const data = getContent().nav;
  const lang = getCurrentLang();
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const basePath = "../";
  const navLinks = data.links
    .map((link) => {
      const href = link.href.startsWith("#")
        ? `${basePath}index.html${link.href}`
        : `${basePath}${link.href}`;
      return `<a href="${href}" class="nav-link text-gray-300 hover:text-amber-400 transition-colors duration-200 text-sm lg:text-base">${link.label}</a>`;
    })
    .join("");

  navbar.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <a href="../index.html" class="text-xl lg:text-2xl font-bold text-white tracking-tight font-title">${data.brand}</a>
        <div class="hidden md:flex items-center gap-6 lg:gap-8">${navLinks}</div>
        <div class="flex items-center gap-3">
          <button id="theme-toggle" aria-label="Toggle theme" class="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-600 hover:border-amber-500 text-gray-400 hover:text-amber-400 transition-all duration-200 text-sm">
            <i class="fas fa-sun" data-theme-icon="sun"></i>
            <i class="fas fa-moon" data-theme-icon="moon"></i>
          </button>
          <div class="relative">
            <button id="lang-dropdown-btn" class="flex items-center gap-2 border border-gray-600 hover:border-amber-500 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:text-amber-400 transition-colors">
              <i class="fas fa-globe text-amber-400 text-xs"></i>
              <span id="lang-current-label">${lang === "ar" ? "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" : lang === "fr" ? "Fran\u00e7ais" : "English"}</span>
              <i class="fas fa-chevron-down text-xs transition-transform duration-200"></i>
            </button>
            <div id="lang-dropdown-menu" class="hidden absolute top-full mt-1 bg-slate-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[130px] overflow-hidden ${lang === "ar" ? "left-0" : "right-0"}">
              <button class="lang-btn block w-full px-4 py-2 text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-400 transition-colors ${lang === "ar" ? "bg-amber-500/10 text-amber-400" : ""}" data-lang="ar">\u0627\u0644\u0639\u0631\u0628\u064a\u0629</button>
              <button class="lang-btn block w-full px-4 py-2 text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-400 transition-colors ${lang === "fr" ? "bg-amber-500/10 text-amber-400" : ""}" data-lang="fr">Fran\u00e7ais</button>
              <button class="lang-btn block w-full px-4 py-2 text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-400 transition-colors ${lang === "en" ? "bg-amber-500/10 text-amber-400" : ""}" data-lang="en">English</button>
            </div>
          </div>
          <button id="mobile-menu-btn" class="md:hidden text-white p-2" aria-label="Menu"><i class="fas fa-bars text-xl"></i></button>
        </div>
      </div>
      <div id="mobile-menu" class="hidden md:hidden pb-4 border-t border-gray-700 pt-4 mt-2">
        <div class="flex flex-col gap-3">${navLinks}</div>
      </div>
    </div>
  `;

  document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
    document.getElementById("mobile-menu")?.classList.toggle("hidden");
  });
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

function getLectureIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderLectureDetail() {
  const lang = getCurrentLang();
  const data = getContent().lectures;
  const lectureId = getLectureIdFromUrl();

  const notFoundEl = document.getElementById("lecture-not-found");
  const contentEl = document.getElementById("lecture-content");

  if (!lectureId) {
    notFoundEl.classList.remove("hidden");
    return;
  }

  const lecture = data.lectures.find((l) => l.id === lectureId);
  if (!lecture) {
    notFoundEl.classList.remove("hidden");
    return;
  }

  contentEl.classList.remove("hidden");

  const labels = {
    ar: { date: "\u0627\u0644\u062a\u0627\u0631\u064a\u062e", location: "\u0627\u0644\u0645\u0643\u0627\u0646", type: "\u0646\u0648\u0639 \u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0629", detail: "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u062d\u0627\u0636\u0631\u0629", back: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0645\u062d\u0627\u0636\u0631\u0627\u062a" },
    fr: { date: "Date", location: "Lieu", type: "Type d\u2019\u00e9v\u00e9nement", detail: "D\u00e9tails de la conf\u00e9rence", back: "Retour aux conf\u00e9rences" },
    en: { date: "Date", location: "Location", type: "Event Type", detail: "Lecture Details", back: "Back to Lectures" },
  };

  const l = labels[lang] || labels.ar;

  const iconEl = document.getElementById("lecture-icon-display");
  const imgEl = document.getElementById("lecture-img");
  if (lecture.icon) {
    iconEl.className = `fas ${lecture.icon} text-amber-400 text-4xl`;
  }
  imgEl.src = `../assets/images/lectures/${lecture.id}.jpg`;
  imgEl.alt = lecture.title;

  document.getElementById("lecture-type-badge").textContent = lecture.type;
  document.getElementById("lecture-date-top").textContent = lecture.date;
  document.getElementById("lecture-title").textContent = lecture.title;
  document.getElementById("lecture-desc").textContent = lecture.desc;
  document.getElementById("lecture-long-desc").textContent = lecture.longDesc;
  document.getElementById("lecture-location").textContent = lecture.location;
  document.getElementById("lecture-date-label").textContent = `${l.date}: ${lecture.date}`;
  document.getElementById("lecture-location-label").textContent = `${l.location}: ${lecture.location}`;
  document.getElementById("lecture-type-label").textContent = `${l.type}: ${lecture.type}`;
  document.getElementById("detail-heading").textContent = l.detail;
  document.getElementById("back-label").textContent = l.back;

  const backLink = document.getElementById("back-link");
  const backIcon = backLink.querySelector("i");
  backIcon.className = lang === "ar" ? "fas fa-arrow-right ml-1" : "fas fa-arrow-left mr-1";
}

function renderAll() {
  renderTopBar();
  renderNavbar();
  renderFooter();
  renderLectureDetail();
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
