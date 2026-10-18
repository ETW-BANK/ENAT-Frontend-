/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eafaf1",
          100: "#c8f2d7",
          200: "#9be6b5",
          300: "#5fd28c",
          400: "#2fb36a",
          500: "#0b6e4f",
          600: "#095c42",
          700: "#084a35",
          800: "#073b2b",
          900: "#052c20",
        },
        gold: {
          400: "#f5c518",
          500: "#e0b012",
          600: "#b88c0c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(11,110,79,0.12)",
      },
    },
  },
  plugins: [],
};