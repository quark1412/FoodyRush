const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", flowbite.content()],
  theme: {
    extend: {
      keyframes: {
        spinAround: {
          "0%": { transform: "rotate(0deg)" },
          "100%": {
            transform: "rotate(180deg)",
          },
        },
      },
      fontFamily: {
        lato: "Lato",
        manrope: "Manrope",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
