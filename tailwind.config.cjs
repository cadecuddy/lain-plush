/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#282828",
      },
      fontFamily: {
        mono: ["consolas", "monaco", "monospace"],
      },
    },
  },
  plugins: [
  ],
};
