/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          light: '#bfa181',
          DEFAULT: '#8b5e3c',
          dark: '#5a3b24',
        },
      },
      fontFamily: {
        pirate: ['"Pirata One"', 'cursive'],
      },
    },
  },
  plugins: [],
}
