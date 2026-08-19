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

function renderAwards() {
  const data = getContent().honors;
  const grid = document.getElementById("awards-grid");
  if (!grid) return;

  const awardsHTML = data.awards
    .map(
      (award) =>
        `<a href="../award/?id=${encodeURIComponent(award.id)}" class="medal-card block group relative pt-10 pb-6 px-5 text-center">
          <span class="medal-ribbon"></span>
          <div class="medal-disc">
            <div class="medal-disc-inner">
              <img src="../assets/images/awards/${award.id}.jpg" alt="${award.title}"
                onerror="this.outerHTML='<div class=medal-img-ph><i class=fas fa-trophy></i></div>'">
            </div>
          </div>
          ${award.year ? `<span class="medal-year">${award.year}</span>` : ""}
          <div class="medal-divider"></div>
          <h3 class="text-lg font-bold text-white font-title leading-snug group-hover:text-amber-400 transition-colors">${award.title}</h3>
          <p class="text-gray-400 text-sm mt-2 leading-relaxed">${award.desc}</p>
          <span class="medal-org"><i class="fas fa-building-columns"></i>${award.organization}</span>
        </a>`
    )
    .join("");

  grid.innerHTML = awardsHTML;
}

function renderContent() {
  const data = getContent().honors;
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
  renderAwards();
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
