/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",   // Navy Blue
        secondary: "#64748B", // Cool Gray
        accent: "#06B6D4",    // Soft Cyan
        background: "#F8FAFC",// White Smoke
        text: "#1E293B",      // Graphite
            // Error colors
        error: "#DC2626",       // Main red
        "error-light": "#FEE2E2", // Light background for alerts
        "error-text": "#7F1D1D",  // Deep red for text
         warning: "#F59E0B",
        "warning-light": "#FEF3C7",

        success: "#16A34A",
        "success-light": "#DCFCE7",
      },
      fontFamily: {
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      lineHeight: {
        hindi: '1.3', // Adjust this value as needed
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // require('tailwind-scrollbar-hide'),
  ],
}

