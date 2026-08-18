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

function renderBooks() {
  const data = getContent().library;
  const grid = document.getElementById("books-grid");
  if (!grid) return;

  const lang = getCurrentLang();

  const coverColors = [
    "from-amber-500/20 to-slate-700/50",
    "from-blue-500/20 to-slate-700/50",
    "from-emerald-500/20 to-slate-700/50",
    "from-purple-500/20 to-slate-700/50",
    "from-rose-500/20 to-slate-700/50",
    "from-cyan-500/20 to-slate-700/50",
    "from-orange-500/20 to-slate-700/50",
    "from-teal-500/20 to-slate-700/50",
  ];

  const booksHTML = data.books
    .map((book, index) => {
      const colorClass = coverColors[index % coverColors.length];
      const detailPage = `../book/?id=${book.id}`;

      const imgPath = `../assets/images/books/${book.id}.jpg`;

      const pagesStr = book.pages > 0
        ? `<span><i class="fas fa-file-alt me-1"></i>${book.pages} ${lang === "ar" ? "صفحة" : "pages"}</span>`
        : "";
      const publisherStr = book.publisher
        ? `<span><i class="fas fa-building me-1"></i>${book.publisher}</span>`
        : "";

      return `
        <a href="${detailPage}" class="group block bg-white/5 border border-gray-700/50 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
          <div class="aspect-[3/4] relative overflow-hidden bg-gradient-to-br ${colorClass}">
            <img src="${imgPath}" alt="${book.title}"
              class="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              onerror="this.style.display='none'"
              onload="this.style.opacity='1'">
          </div>
          <div class="p-4">
            <span class="inline-block text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">${book.type}</span>
            <h3 class="text-base font-bold text-white mt-1.5 font-title leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">${book.title}</h3>
            <p class="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">${book.desc}</p>
            <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span><i class="fas fa-calendar me-1"></i>${book.year}</span>
              ${pagesStr}
            </div>
            ${publisherStr ? `<p class="text-gray-500 text-xs mt-1 truncate">${publisherStr}</p>` : ""}
          </div>
        </a>`;
    })
    .join("");

  grid.innerHTML = booksHTML;
}

function renderContent() {
  const data = getContent().library;
  document.getElementById("page-heading").textContent = data.heading;
  document.getElementById("page-subtitle").textContent = data.subtitle;
  document.getElementById("back-label").textContent = data.backLabel;

  const lang = getCurrentLang();
  const dir = lang === "ar" ? "rtl" : "ltr";
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
  renderBooks();
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
