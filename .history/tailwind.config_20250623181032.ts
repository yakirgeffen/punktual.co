import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import { heroui } from "@heroui/react";

const config = {
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#ecfdf5",
              100: "#d1fae5", 
              200: "#a7f3d0",
              300: "#6ee7b7",
              400: "#34d399",
              500: "#10b981", // emerald-500
              600: "#059669",
              700: "#047857",
              800: "#065f46",
              900: "#064e3b",
              DEFAULT: "#10b981"
            }
          }
        }
      }
    })
  ]
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;