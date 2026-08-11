import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hc: {
          blue: "#2563EB",
          slate: "#0f172a",
          panel: "#f1f5f9",
          ink: "#0f172a",
          accent: "#0369a1",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
