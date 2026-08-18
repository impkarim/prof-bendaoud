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

function getAwardIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderAwardDetail() {
  const lang = getCurrentLang();
  const data = getContent().honors;
  const awardId = getAwardIdFromUrl();

  const notFoundEl = document.getElementById("award-not-found");
  const contentEl = document.getElementById("award-content");

  if (!awardId) {
    notFoundEl.classList.remove("hidden");
    return;
  }

  const award = data.awards.find((a) => a.id === awardId);
  if (!award) {
    notFoundEl.classList.remove("hidden");
    return;
  }

  contentEl.classList.remove("hidden");

  const labels = {
    ar: { year: "\u0627\u0644\u0633\u0646\u0629", org: "\u0627\u0644\u062c\u0647\u0629 \u0627\u0644\u0645\u0627\u0646\u062d\u0629", location: "\u0627\u0644\u0645\u0643\u0627\u0646", detail: "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062a\u0643\u0631\u064a\u0645", back: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u062a\u0643\u0631\u064a\u0645\u0627\u062a" },
    en: { year: "Year", org: "Organization", location: "Location", detail: "Award Details", back: "Back to Honors" },
  };

  const l = labels[lang] || labels.ar;

  const yearBadge = document.getElementById("award-year-badge");
  const yearTop = document.getElementById("award-year-top");
  const yearLabel = document.getElementById("award-year-label");
  if (award.year) {
    yearBadge.textContent = award.year;
    yearBadge.classList.remove("hidden");
    yearTop.textContent = award.year;
    yearLabel.textContent = `${l.year}: ${award.year}`;
  } else {
    yearBadge.classList.add("hidden");
    yearTop.textContent = "";
    yearLabel.textContent = "";
  }
  const iconEl = document.getElementById("award-icon-display");
  const imgEl = document.getElementById("award-img");
  imgEl.src = `../assets/images/awards/${award.id}.jpg`;
  imgEl.alt = award.title;
  document.getElementById("award-title").textContent = award.title;
  document.getElementById("award-desc").textContent = award.desc;
  document.getElementById("award-long-desc").textContent = award.longDesc;
  document.getElementById("award-org").textContent = award.organization;
  document.getElementById("award-location").textContent = award.location;
  document.getElementById("award-org-label").textContent = `${l.org}: ${award.organization}`;
  document.getElementById("award-location-label").textContent = `${l.location}: ${award.location}`;
  document.getElementById("detail-heading").textContent = l.detail;
  document.getElementById("back-label").textContent = l.back;

  const backLink = document.getElementById("back-link");
  const backIcon = backLink.querySelector("i");
  backIcon.className = lang === "ar" ? "fas fa-arrow-right me-1" : "fas fa-arrow-left mr-1";
}

function renderAll() {
  renderTopBar();
  renderNavbar();
  renderFooter();
  renderAwardDetail();
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
