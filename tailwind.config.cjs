/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 2s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
