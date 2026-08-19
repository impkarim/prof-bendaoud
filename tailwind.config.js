/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.html", "./assets/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        title: ["Amiri", "serif"],
        arabic: ["Tajawal", "sans-serif"],
        latin: ["Inter", "sans-serif"],
      },
      colors: {
        slate: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
          500: "#64748b",
          400: "#94a3b8",
          300: "#cbd5e1",
          200: "#e2e8f0",
        },
        amber: {
          500: "#d97706",
          600: "#b45309",
          400: "#f59e0b",
          300: "#fbbf24",
        },
      },
    },
  },
  plugins: [],
};