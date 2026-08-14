/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F97316',
        secondary: '#FBBF24',
        accent: '#10B981',
        slateText: '#334155',
        softGray: '#F8FAFC',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
