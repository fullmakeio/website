import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "media",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from BRAND_GUIDE.md
        brand: {
          bg: "#FAFAF9",
          surface: "#FFFFFF",
          text: "#1C1917",
          secondary: "#78716C",
          tertiary: "#A8A29E",
          accent: "#D97706",
          "accent-hover": "#B45309",
          "accent-light": "#FEF3C7",
          success: "#16A34A",
          error: "#DC2626",
          info: "#2563EB",
          code: "#292524",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
