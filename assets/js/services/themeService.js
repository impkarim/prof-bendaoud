function getTheme() {
  return localStorage.getItem("theme") || "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function setTheme(theme) {
  localStorage.setItem("theme", theme);
  applyTheme(theme);
}

function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

function initTheme() {
  applyTheme(getTheme());
}

export { getTheme, setTheme, toggleTheme, applyTheme, initTheme };
