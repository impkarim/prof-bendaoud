import { initLanguage, getContent, setLanguage, getCurrentLang } from "../services/langService.js";
import { initTheme, toggleTheme } from "../services/themeService.js";
import { initPageTransitions } from "../services/pageTransition.js";
import { renderTopBar, renderNavbar } from "../services/navbarService.js";





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

function renderLectures() {
  const data = getContent().lectures;
  const grid = document.getElementById("lectures-grid");
  if (!grid) return;

  const iconColors = [
    "from-amber-500/20 to-slate-700/50",
    "from-blue-500/20 to-slate-700/50",
    "from-emerald-500/20 to-slate-700/50",
    "from-purple-500/20 to-slate-700/50",
    "from-rose-500/20 to-slate-700/50",
    "from-cyan-500/20 to-slate-700/50",
  ];

  const lecturesHTML = data.lectures
    .map((lecture, index) => {
      const colorClass = iconColors[index % iconColors.length];
      return `
        <a href="../lecture/?id=${encodeURIComponent(lecture.id)}" class="group block bg-white/5 border border-gray-700/50 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
          <div class="h-32 overflow-hidden bg-gradient-to-br ${colorClass}">
            <img src="../assets/images/lectures/${lecture.id}.jpg" alt="${lecture.title}"
              class="w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              onerror="this.style.display='none'"
              onload="this.style.opacity='1'">
          </div>
          <div class="p-5">
            <span class="inline-block text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">${lecture.type}</span>
            <h3 class="text-lg font-bold text-white mt-2 font-title leading-tight group-hover:text-amber-400 transition-colors">${lecture.title}</h3>
            <p class="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-2">${lecture.desc}</p>
            <div class="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span><i class="fas fa-calendar me-1"></i>${lecture.date}</span>
              <span><i class="fas fa-map-marker-alt me-1"></i>${lecture.location}</span>
            </div>
          </div>
        </a>`;
    })
    .join("");

  grid.innerHTML = lecturesHTML;
}

function renderSubjects() {
  const data = getContent().lectures;
  const grid = document.getElementById("subjects-grid");
  const heading = document.getElementById("subjects-heading");
  if (!grid || !heading) return;

  heading.textContent = data.subjectsHeading;

  const subjectsHTML = data.subjects
    .map((subject, index) => {
      const parts = subject.split(/(?=لطلبة|لطلاب)/);
      const name = parts[0].replace(/^مادة\s+/, "");
      const detail = parts[1] || "";
      return `
        <div class="group border-b border-gray-700/30 pb-4 pt-4 first:pt-0 last:border-b-0 hover:border-amber-500/30 transition-colors duration-300">
          <div class="flex items-baseline gap-4">
            <span class="text-amber-400/30 text-xs font-mono w-5 flex-shrink-0 text-left tabular-nums">${String(index + 1).padStart(2, '0')}</span>
            <div class="flex-1 min-w-0">
              <p class="text-amber-400 font-bold text-base font-title leading-snug">${name}</p>
              ${detail ? `<p class="text-gray-400 text-sm mt-1.5 leading-relaxed">${detail}</p>` : ""}
            </div>
          </div>
        </div>`;
    })
    .join("");

  grid.innerHTML = subjectsHTML;
}

function renderContent() {
  const data = getContent().lectures;
  document.getElementById("page-heading").textContent = data.heading;
  document.getElementById("page-subtitle").textContent = data.subtitle;
  document.getElementById("back-label").textContent = data.backLabel;

  const lang = getCurrentLang();
  const backLink = document.getElementById("back-link");
  const icon = backLink.querySelector("i");
  if (lang === "ar") {
    icon.className = "fas fa-arrow-right me-1";
  } else {
    icon.className = "fas fa-arrow-left mr-1";
  }
}

function renderAll() {
  renderTopBar();
  renderNavbar();
  renderFooter();
  renderContent();
  renderLectures();
  renderSubjects();
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
