/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        surface: '#f7f9fc',
        brand: '#2563eb'
      },
      boxShadow: {
        soft: '0 12px 32px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
