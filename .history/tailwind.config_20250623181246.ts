import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

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
              DEFAULT: "#10b981",
              foreground: "#ffffff"
            }
          }
        },
        dark: {
          colors: {
            primary: {
              50: "#064e3b",
              100: "#065f46", 
              200: "#047857",
              300: "#059669",
              400: "#10b981",
              500: "#34d399", // lighter emerald for dark mode
              600: "#6ee7b7",
              700: "#a7f3d0",
              800: "#d1fae5",
              900: "#ecfdf5",
              DEFAULT: "#34d399",
              foreground: "#064e3b"
            }
          }
        }
      }
    })
  ],
};

export default config;