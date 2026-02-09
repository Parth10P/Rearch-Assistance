/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FAF1E8",
          100: "#F5E3D1",
          200: "#EFD5BA",
          300: "#EAC7A4",
          400: "#E5B98D",
          500: "#E0AB76", // Sandy Clay - warm, friendly
          600: "#D58E47",
          700: "#BA722A",
          800: "#8B5520",
          900: "#5D3915",
        },
        secondary: {
          50: "#F0E3E2",
          100: "#E1C7C4",
          200: "#D3ABA7",
          300: "#C48F89",
          400: "#B5736C",
          500: "#A45A52", // Terracotta Clay - earthy, warm
          600: "#884B44",
          700: "#6D3C37",
          800: "#512D29",
          900: "#361E1B",
        },
        accent: {
          50: "#FEEAE8",
          100: "#FDD5D2",
          200: "#FBC1BB",
          300: "#FAACA5",
          400: "#F9978E",
          500: "#F88379", // Sweet Salmon - gentle, approachable
          600: "#F54D3D",
          700: "#E91F0C",
          800: "#AE1709",
          900: "#740F06",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
