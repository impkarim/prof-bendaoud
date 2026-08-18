import { getContent, getCurrentLang } from "./langService.js";

function getBasePath() {
  const cleanPath = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  const depth = cleanPath.split("/").filter(Boolean).length;
  return depth > 0 ? "../".repeat(depth) : "";
}

export function renderTopBar() {
  const data = getContent().topbar;
  const topbar = document.getElementById("topbar");
  if (!topbar) return;

  topbar.innerHTML = `
    <div class="fixed top-0 left-0 right-0 z-50 bg-slate-800/90 border-b border-gray-700/50 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-9">
          <div class="flex items-center gap-4">
            <span class="text-gray-400"><i class="fas fa-envelope me-1.5 text-amber-400"></i>${data.email}</span>
            <span class="text-gray-400 hidden sm:inline"><i class="fas fa-phone-alt me-1.5 text-amber-400"></i>${data.phone}</span>
          </div>
          <div class="flex items-center gap-3">
            ${data.social.map(s => `<a href="${s.url}" target="_blank" rel="noopener" title="${s.title}" class="text-gray-400 hover:text-amber-400 transition-colors"><i class="${s.icon}"></i></a>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderNavbar() {
  const data = getContent().nav;
  const lang = getCurrentLang();
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const basePath = getBasePath();
  const homeHref = basePath ? `${basePath}index.html` : "./";

  const navLinks = data.links
    .map((link) => {
      const href = link.href.startsWith("#")
        ? (basePath ? `${basePath}index.html${link.href}` : link.href)
        : `${basePath}${link.href}`;
      return `<a href="${href}" class="nav-link text-gray-300 hover:text-amber-400 transition-colors duration-200 text-sm lg:text-base">${link.label}</a>`;
    })
    .join("");

  navbar.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <a href="${homeHref}" class="text-xl lg:text-2xl font-bold text-white tracking-tight font-title">${data.brand}</a>
        <div class="hidden md:flex items-center gap-6 lg:gap-8">${navLinks}</div>
        <div class="flex items-center gap-3">
          <button id="theme-toggle" aria-label="Toggle theme" class="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-600 hover:border-amber-500 text-gray-400 hover:text-amber-400 transition-all duration-200 text-sm">
            <i class="fas fa-sun" data-theme-icon="sun"></i>
            <i class="fas fa-moon" data-theme-icon="moon"></i>
          </button>
          <div class="relative">
            <button id="lang-dropdown-btn" class="flex items-center gap-2 border border-gray-600 hover:border-amber-500 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:text-amber-400 transition-colors">
              <i class="fas fa-globe text-amber-400 text-xs"></i>
              <span id="lang-current-label">${lang === "ar" ? "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" : "English"}</span>
              <i class="fas fa-chevron-down text-xs transition-transform duration-200"></i>
            </button>
            <div id="lang-dropdown-menu" class="hidden absolute top-full mt-1 bg-slate-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[130px] overflow-hidden ${lang === "ar" ? "right-0" : "left-0"}">
              <button class="lang-btn block w-full px-4 py-2 text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-400 transition-colors ${lang === "ar" ? "bg-amber-500/10 text-amber-400" : ""}" data-lang="ar">\u0627\u0644\u0639\u0631\u0628\u064a\u0629</button>
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