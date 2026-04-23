/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ff: {
          lightBg: "#F5E6D3",
          primary: "#8B5E3C",
          accent: "#D4B483",
          darkBg: "#2B1B12",
          darkCard: "#3A2618",
          darkText: "#F5E6D3"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};
