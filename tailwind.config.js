/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FDFAF6',
        forest: {
          DEFAULT: '#2D5016',
          light: '#3d6b1f',
          dark: '#1e3610',
        },
        amber: {
          DEFAULT: '#D4A853',
          light: '#e0bc78',
          dark: '#b8922e',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
