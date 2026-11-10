/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#11152B',       // Primary: Midnight Navy
          violet: '#7657F6',     // Brand Accent: Electric Violet
          teal: '#20C9B0',       // Secondary Accent: Growth Teal
          cloud: '#F5F6FA',      // Light Background: Cloud White
        },
        midnight: '#11152B',
        electricViolet: '#7657F6',
        growthTeal: '#20C9B0',
        cloudWhite: '#F5F6FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(118, 87, 246, 0.35)',
        'teal-glow': '0 0 25px -5px rgba(32, 201, 176, 0.35)',
      },
    },
  },
  plugins: [],
};

