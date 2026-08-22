/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#fdf8f0',
          100: '#f5ead6',
          200: '#e8d4b0',
          300: '#d4a574',
          400: '#c48a52',
          500: '#a0673a',
          600: '#8B4513',
          700: '#6B3410',
          800: '#4a250e',
          900: '#2d1608',
        },
      },
    },
  },
  daisyui: {
    themes: ['light'],
    logs: false,
  },
  plugins: [require('daisyui')],
}
