import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        canvas: "#f7f5f2",
        line: "#e7e3dd",
        rose: { DEFAULT: "#e11d48", soft: "#fff1f2" },
        mint: { DEFAULT: "#16a34a", soft: "#ecfdf5" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.03), 0 12px 32px rgba(15,23,42,.07)",
      },
    },
  },
  plugins: [],
} satisfies Config;
