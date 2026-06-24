/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pku: {
          red: '#8B0000',
          gold: '#C5A55A',
        },
      },
    },
  },
  plugins: [],
};
