/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'glow-magenta': '#D5106E',
        'glow-purple':  '#6E3992',
        'glow-pink':    '#FF6BAD',
        midnight:       '#070B16',
        'midnight-2':   '#0A0A15',
        'midnight-3':   '#0F0F1A',
      },
      boxShadow: {
        glow:           '0 0 30px rgba(213,16,110,0.18)',
        'glow-magenta': '0 0 25px rgba(213,16,110,0.45), 0 0 60px rgba(213,16,110,0.18)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        sans:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'glow-grid':
          'radial-gradient(circle at top, rgba(213,16,110,0.18),transparent 35%), radial-gradient(circle at bottom right, rgba(110,57,146,0.12),transparent 28%)',
      },
    },
  },
  plugins: [],
};


