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
      author: "البروفيسور براهيم بن داود",
      pages: "صفحة",
      desc: "الوصف",
      chapters: "فهرس المحتويات",
      publisher: "الناشر",
      back: "العودة للمكتبة",
    },
    en: {
      author: "Prof. Brahim Bendaoud",
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
    pagesEl.innerHTML = `<i class="fas fa-file-alt text-amber-500 me-1"></i>${book.pages} ${l.pages}`;
    pagesEl.classList.remove("hidden");
  } else {
    pagesEl.classList.add("hidden");
  }

  document.getElementById("book-year").innerHTML = `<i class="fas fa-calendar text-amber-500 me-1"></i>${book.year}`;

  const isbnEl = document.getElementById("book-isbn");
  if (book.isbn) {
    isbnEl.innerHTML = `<i class="fas fa-barcode text-amber-500 me-1"></i>${book.isbn}`;
    isbnEl.classList.remove("hidden");
  } else {
    isbnEl.classList.add("hidden");
  }

  const publisherEl = document.getElementById("book-publisher");
  if (book.publisher) {
    publisherEl.innerHTML = `<i class="fas fa-building text-amber-500 me-1"></i>${book.publisher}`;
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
    backIcon.className = "fas fa-arrow-right me-1";
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
