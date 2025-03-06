/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          900: '#003399', // Primary brand color
          800: '#0047AB', // Secondary brand color
          700: '#0056b3',
          50: '#f0f5ff',
        }
      },
    },
  },
  plugins: [],
}