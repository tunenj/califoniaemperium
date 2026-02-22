/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#ffffff",
        secondary: "#C62828",
        accent: "#AD2831",
        darkRed: "#7B2A2A",
        lightPink: "#FFB6C1",
      },
      fontFamily: {
        pbold: ["SF-Bold", "sans-serif"],
        psemibold: ["SF-Semi-Bold", "sans-serif"],
        pmedium: ["SF-Medium", "sans-serif"],
        pregular: ["SF-Regular", "sans-serif"],
      },
    },
  },
  plugins: [],
};
