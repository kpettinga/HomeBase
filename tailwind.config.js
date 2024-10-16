/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['DM Sans', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
    },
    extend: {
      animation: {
        'spin-ambient': 'spin 10s linear infinite',
        'spin-slow': 'spin 1s linear infinite',
        'spin': 'spin 0.7s linear infinite',
        'spin-fast': 'spin 0.4s linear infinite',
      }
    },
  },
  plugins: [],
}

