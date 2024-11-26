/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      fontFamily:{
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      lineHeight: {
        hindi: '1.3', // Adjust this value as needed
      },
    },
  },
  plugins: [],
}

