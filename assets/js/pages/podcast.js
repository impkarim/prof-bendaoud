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

function renderPodcast() {
  const data = getContent().podcast;
  const grid = document.getElementById("podcast-grid");
  if (!grid) return;

  const iconColors = [
    "from-amber-500/20 to-slate-700/50",
    "from-blue-500/20 to-slate-700/50",
    "from-emerald-500/20 to-slate-700/50",
    "from-purple-500/20 to-slate-700/50",
    "from-rose-500/20 to-slate-700/50",
    "from-cyan-500/20 to-slate-700/50",
  ];

  const episodesHTML = data.episodes
    .map((episode, index) => {
      const colorClass = iconColors[index % iconColors.length];
      const hasVideo = episode.videoId && episode.videoId.trim() !== "";
      const card = `
        <div class="group block bg-white/5 border border-gray-700/50 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
          <div class="relative aspect-video bg-gradient-to-br ${colorClass}">
            ${hasVideo ? `
              <img src="https://img.youtube.com/vi/${episode.videoId}/hqdefault.jpg" alt="${episode.title}"
                class="absolute inset-0 w-full h-full object-cover">
              <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button type="button" data-play-video="${episode.videoId}" data-title="${episode.title}" class="podcast-play w-16 h-16 rounded-full bg-amber-500/90 text-slate-900 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-110 hover:bg-amber-400 focus:outline-none">
                  <i class="fas fa-play ms-1"></i>
                </button>
              </div>` : `
              <span class="absolute inset-0 flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-amber-500/30 text-amber-400 text-xl">
                <i class="fas fa-microphone"></i>
              </span>`}
          </div>
          <div class="p-5">
            <span class="inline-block text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">${episode.type}</span>
            <h3 class="text-lg font-bold text-white mt-2 font-title leading-tight group-hover:text-amber-400 transition-colors">${episode.title}</h3>
            <p class="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-2">${episode.desc}</p>
            <div class="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span><i class="fas fa-calendar me-1"></i>${episode.date}</span>
              <span><i class="fas fa-clock me-1"></i>${episode.duration}</span>
              ${hasVideo ? `
              <a href="https://www.youtube.com/watch?v=${episode.videoId}" target="_blank" rel="noopener" class="ms-auto inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors">
                <i class="fab fa-youtube"></i>YouTube
              </a>` : ""}
            </div>
          </div>
        </div>`;
      return card;
    })
    .join("");

  grid.innerHTML = episodesHTML;

  grid.querySelectorAll("[data-play-video]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openVideoModal(btn.dataset.playVideo, btn.dataset.title);
    });
  });
}

function openVideoModal(videoId, title) {
  let modal = document.getElementById("video-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "video-modal";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6";
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-video-close></div>
      <div class="relative w-full max-w-4xl bg-slate-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-700/60 bg-slate-900/95">
          <h3 id="video-modal-title" class="text-white font-bold text-sm sm:text-base font-title truncate pe-4"></h3>
          <button type="button" data-video-close aria-label="Close" class="flex-shrink-0 w-8 h-8 rounded-full border border-gray-600 text-gray-400 hover:text-amber-400 hover:border-amber-500 transition-colors flex items-center justify-center text-sm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="aspect-video bg-black">
          <iframe id="video-modal-frame" class="w-full h-full" title="YouTube video player" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelectorAll("[data-video-close]").forEach((el) => {
      el.addEventListener("click", () => closeVideoModal(modal));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("hidden") === false) closeVideoModal(modal);
    });
  }

  document.getElementById("video-modal-title").textContent = title || "";
  const frame = document.getElementById("video-modal-frame");
  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeVideoModal(modal) {
  const frame = document.getElementById("video-modal-frame");
  if (frame) frame.src = "";
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

function renderContent() {
  const data = getContent().podcast;
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
  renderPodcast();
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