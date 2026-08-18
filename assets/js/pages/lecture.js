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
