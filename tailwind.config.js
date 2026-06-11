/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: "#F0F6F3",
          100: "#DCE9E2",
          200: "#B8D3C6",
          300: "#8CB8A4",
          400: "#5E9880",
          500: "#3D7A63",
          600: "#2E624F",
          700: "#1F5140",
          800: "#173D30",
          900: "#0F2A21",
          950: "#081712",
        },
        copper: {
          50: "#FAF5EF",
          100: "#F2E4D1",
          200: "#E6C9A1",
          300: "#D9A972",
          400: "#CE9154",
          500: "#C68B59",
          600: "#A86F42",
          700: "#855535",
          800: "#63402C",
          900: "#3D271B",
        },
        ink: {
          50: "#F5F3EE",
          100: "#E8E4DC",
          200: "#CFC9BE",
          300: "#A8A092",
          400: "#8A94A0",
          500: "#5C6670",
          600: "#404952",
          700: "#2A3138",
          800: "#1A1D21",
          900: "#101316",
          950: "#0A0C0E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Noto Serif SC'", "'Source Han Serif CN'", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover": "0 2px 4px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
