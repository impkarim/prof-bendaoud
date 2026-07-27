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

function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderBookDetail() {
  const lang = getCurrentLang();
  const data = getContent().library;
  const bookId = getBookIdFromUrl();

  const notFoundEl = document.getElementById("book-not-found");
  const contentEl = document.getElementById("book-content");

  if (!bookId) {
    notFoundEl.classList.remove("hidden");
    return;
  }

  const book = data.books.find((b) => b.id === bookId);
  if (!book) {
    notFoundEl.classList.remove("hidden");
    return;
  }

  contentEl.classList.remove("hidden");

  const labels = {
    ar: {
      author: "البروفيسور بن داود براهيم",
      pages: "صفحة",
      desc: "الوصف",
      chapters: "فهرس المحتويات",
      publisher: "الناشر",
      back: "العودة للمكتبة",
    },
    fr: {
      author: "Pr. Bendaoud Brahim",
      pages: "pages",
      desc: "Description",
      chapters: "Table des matières",
      publisher: "Éditeur",
      back: "Retour à la bibliothèque",
    },
    en: {
      author: "Prof. Bendaoud Brahim",
      pages: "pages",
      desc: "Description",
      chapters: "Table of Contents",
      publisher: "Publisher",
      back: "Back to Library",
    },
  };

  const l = labels[lang] || labels.ar;

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

  const bookIndex = data.books.indexOf(book);
  const colorClass = coverColors[bookIndex % coverColors.length];

  const imgPath = `../assets/images/books/${book.id}.jpg`;
  const coverEl = document.getElementById("book-cover");
  coverEl.className = `w-full aspect-[3/4] rounded-2xl relative overflow-hidden border border-amber-500/30 bg-gradient-to-br ${colorClass}`;
  coverEl.innerHTML = `
    <img src="${imgPath}" alt="${book.title}"
      class="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500 z-10"
      onerror="this.style.display='none'"
      onload="this.style.opacity='1'">`;
  document.getElementById("book-type-badge").textContent = book.type;
  document.getElementById("book-title").textContent = book.title;
  document.getElementById("book-author").textContent = l.author;

  const pagesEl = document.getElementById("book-pages");
  if (book.pages > 0) {
    pagesEl.innerHTML = `<i class="fas fa-file-alt text-amber-500 ml-1"></i>${book.pages} ${l.pages}`;
    pagesEl.classList.remove("hidden");
  } else {
    pagesEl.classList.add("hidden");
  }

  document.getElementById("book-year").innerHTML = `<i class="fas fa-calendar text-amber-500 ml-1"></i>${book.year}`;

  const isbnEl = document.getElementById("book-isbn");
  if (book.isbn) {
    isbnEl.innerHTML = `<i class="fas fa-barcode text-amber-500 ml-1"></i>${book.isbn}`;
    isbnEl.classList.remove("hidden");
  } else {
    isbnEl.classList.add("hidden");
  }

  const publisherEl = document.getElementById("book-publisher");
  if (book.publisher) {
    publisherEl.innerHTML = `<i class="fas fa-building text-amber-500 ml-1"></i>${book.publisher}`;
    publisherEl.classList.remove("hidden");
  } else {
    publisherEl.classList.add("hidden");
  }

  document.getElementById("book-long-desc").textContent = book.longDesc;
  document.getElementById("desc-heading").textContent = l.desc;
  document.getElementById("back-label").textContent = l.back;

  const chaptersSection = document.getElementById("chapters-section");
  if (book.chapters && book.chapters.length > 0) {
    chaptersSection.classList.remove("hidden");
    document.getElementById("chapters-heading").textContent = l.chapters;
    const chaptersList = document.getElementById("chapters-list");
    chaptersList.innerHTML = book.chapters
      .map(
        (ch, i) =>
          `<li class="flex items-start gap-3 text-gray-300 text-sm lg:text-base p-2 rounded-lg hover:bg-white/5 transition-colors">
            <span class="w-7 h-7 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">${i + 1}</span>
            <span class="mt-1">${ch}</span>
          </li>`
      )
      .join("");
  } else {
    chaptersSection.classList.add("hidden");
  }

  const backLink = document.getElementById("back-link");
  const backIcon = backLink.querySelector("i");
  if (lang === "ar") {
    backIcon.className = "fas fa-arrow-right ml-1";
  } else {
    backIcon.className = "fas fa-arrow-left mr-1";
  }
}

function renderAll() {
  renderTopBar();
  renderNavbar();
  renderFooter();
  renderBookDetail();
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
