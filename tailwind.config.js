// tailwind.config.js
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "nord",
      {
        diagnosticTheme: {
          "primary": "#2563eb",      // Blue-600 – Buttons, links
          "secondary": "#38bdf8",    // Sky-400 – Highlights, sub-actions
          "accent": "#14b8a6",       // Teal-500 – Accents, toggle buttons
          "neutral": "#1e293b",      // Slate-800 – Navbar, modal backgrounds
          "base-100": "#f8fafc",     // Slate-50 – Page background
          "info": "#0ea5e9",         // Sky-500 – Info messages
          "success": "#10b981",      // Emerald-500 – Success messages
          "warning": "#f59e0b",      // Amber-500 – Warnings
          "error": "#ef4444",        // Red-500 – Errors
        },
      },
    ],
  },
};
