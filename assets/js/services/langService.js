import { content as contentAr } from "../data/content-ar.js";
import { content as contentFr } from "../data/content-fr.js";
import { content as contentEn } from "../data/content-en.js";

const STORAGE_KEY = "ibendaoud-lang";

const contentMap = {
  ar: contentAr,
  fr: contentFr,
  en: contentEn,
};

let currentLang = "ar";

function getBrowserLanguage() {
  try {
    const navLang = navigator.language || navigator.userLanguage || "";
    if (navLang.startsWith("fr")) return "fr";
    if (navLang.startsWith("en")) return "en";
    return "ar";
  } catch {
    return "ar";
  }
}

function loadSavedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

function applyDirection(lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lang === "ar" ? "ar" : lang);
}

function applyFontClass(lang) {
  const html = document.documentElement;
  html.classList.remove("lang-ar", "lang-fr", "lang-en");
  html.classList.add("lang-" + lang);
}

export function getCurrentLang() {
  return currentLang;
}

export function getContent() {
  return contentMap[currentLang] || contentAr;
}

export function setLanguage(lang) {
  if (!contentMap[lang]) return;
  currentLang = lang;
  saveLanguage(lang);
  applyDirection(lang);
  applyFontClass(lang);
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
}

export function getAvailableLanguages() {
  return [
    { code: "ar", label: "العربية" },
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
  ];
}

export function initLanguage() {
  const saved = loadSavedLanguage();
  const initial = saved || "ar";
  setLanguage(initial);
  return initial;
}
