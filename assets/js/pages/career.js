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
    </div>`;
}

function getCategory(description, title) {
  const t = (title + " " + description).toLowerCase();
  if (t.includes("استاذ") || t.includes("profess") || t.includes("maître") || t.includes("assistant") || t.includes("chargé") || t.includes("lectur") || t.includes("مندوب") || t.includes("محاضر") || t.includes("مكلف") || t.includes("doyen") || t.includes("عميد") || t.includes("dean") || t.includes("رئيس قسم") || t.includes("head of dep") || t.includes("chef")) return { label: { ar: "تدرج مهني", en: "Promotion" }, color: "from-amber-400/20 to-amber-600/10 border-amber-500/20", badgeBg: "bg-amber-500/10" };
  if (t.includes("تدريس") || t.includes("تعليم") || t.includes("تكوين") || t.includes("formation") || t.includes("training") || t.includes("course") || t.includes("دورة") || t.includes("تدري") || t.includes("teach") || t.includes("supervis")) return { label: { ar: "تدريس", en: "Teaching" }, color: "from-blue-400/20 to-blue-600/10 border-blue-500/20", badgeBg: "bg-blue-500/10" };
  if (t.includes("بحث") || t.includes("recherche") || t.includes("research") || t.includes("cnepru") || t.includes("pnr") || t.includes("prfu") || t.includes("فرقة") || t.includes("مشروع") || t.includes("project") || t.includes("groupe") || t.includes("équipe") || t.includes("team") || t.includes("laborat") || t.includes("مخبر")) return { label: { ar: "بحث علمي", en: "Research" }, color: "from-emerald-400/20 to-emerald-600/10 border-emerald-500/20", badgeBg: "bg-emerald-500/10" };
  if (t.includes("مجلة") || t.includes("revue") || t.includes("journal") || t.includes("تحرير") || t.includes("rédact") || t.includes("editor") || t.includes("تحكيم") || t.includes("arbitrag") || t.includes("نشر") || t.includes("public") || t.includes("مؤسس") || t.includes("fondat") || t.includes("founder") || t.includes("مدير")) return { label: { ar: "تحرير ونشر", en: "Editorial" }, color: "from-purple-400/20 to-purple-600/10 border-purple-500/20", badgeBg: "bg-purple-500/10" };
  if (t.includes("ملتقى") || t.includes("ندوة") || t.includes("مؤتمر") || t.includes("forum") || t.includes("conférence") || t.includes("conference") || t.includes("symposium") || t.includes("colloque") || t.includes(" يوم ") || t.includes("journée") || t.includes("study day")) return { label: { ar: "ملتقيات", en: "Conferences" }, color: "from-rose-400/20 to-rose-600/10 border-rose-500/20", badgeBg: "bg-rose-500/10" };
  if (t.includes("لجنة") || t.includes("comité") || t.includes("committee") || t.includes("commission") || t.includes("مجلس") || t.includes("conseil") || t.includes("council") || t.includes("quality") || t.includes("جودة") || t.includes("assurance") || t.includes("عضوية") || t.includes("membre") || t.includes("member")) return { label: { ar: "عضوية لجان", en: "Committee" }, color: "from-cyan-400/20 to-cyan-600/10 border-cyan-500/20", badgeBg: "bg-cyan-500/10" };
  return { label: { ar: "إنجاز", en: "Achievement" }, color: "from-amber-400/20 to-amber-600/10 border-amber-500/20", badgeBg: "bg-amber-500/10" };
}

function renderCareerItems() {
  const data = getContent().careerDetails;
  const list = document.getElementById("career-list");
  if (!list) return;

  const lang = getCurrentLang();

  const itemsHTML = data.items
    .map((item, index) => {
      const cat = getCategory(item.description, item.title);
      const catLabel = cat.label[lang] || cat.label.ar;
      const isLast = index === data.items.length - 1;
      return `
        <div class="group relative flex gap-5 lg:gap-6">
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg shadow-amber-500/5 group-hover:shadow-amber-500/15 transition-all duration-300 group-hover:scale-110">
              <span class="text-xs lg:text-sm font-bold text-amber-400">${item.year}</span>
            </div>
            ${isLast ? "" : `<div class="w-px flex-1 bg-gradient-to-b from-amber-500/20 to-transparent mt-2"></div>`}
          </div>
          <div class="flex-1 min-w-0 ${isLast ? "pb-0" : "pb-8 lg:pb-10"}">
            <div class="bg-white/[0.02] group-hover:bg-white/[0.04] rounded-2xl border border-gray-700/30 group-hover:border-amber-500/15 transition-all duration-300 p-4 lg:p-5 backdrop-blur-sm relative overflow-hidden hover:scale-[1.01] lg:hover:scale-[1.015]">
              <div class="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-bl ${cat.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-[9px] font-semibold px-2 py-0.5 rounded-full ${cat.badgeBg} text-gray-300">${catLabel}</span>
                </div>
                <h3 class="text-white font-bold text-sm lg:text-base font-title leading-tight group-hover:text-amber-400 transition-colors">${item.title}</h3>
                <p class="text-gray-400 text-xs lg:text-sm mt-1.5 leading-relaxed">${item.description}</p>
              </div>
            </div>
          </div>
        </div>`;
    })
    .join("");

  list.innerHTML = itemsHTML;
}

function renderContent() {
  const data = getContent().careerDetails;
  document.getElementById("page-heading").textContent = data.heading;
  document.getElementById("page-subtitle").textContent = data.subtitle;
  document.getElementById("back-label").textContent = data.backLabel;

  const lang = getCurrentLang();
  const backLink = document.getElementById("back-link");
  const icon = backLink.querySelector("i");
  icon.className = lang === "ar" ? "fas fa-arrow-right me-1" : "fas fa-arrow-left mr-1";
}

function renderAll() {
  renderTopBar();
  renderNavbar();
  renderFooter();
  renderContent();
  renderCareerItems();
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
