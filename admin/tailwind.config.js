/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'glow-magenta': '#D5106E',
        'glow-purple': '#7C3AED',
        midnight: '#070B16',
      },
      boxShadow: {
        glow: '0 0 30px rgba(213, 16, 110, 0.18)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'glow-grid':
          'radial-gradient(circle at top, rgba(213, 16, 110, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.12), transparent 28%)',
      },
    },
  },
  plugins: [],
};
