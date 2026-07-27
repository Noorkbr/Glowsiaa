/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'glow-magenta': '#D5106E',
        'glow-purple': '#6E3992',
        midnight: '#0B0B12'
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'float': 'floatY 5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(213,16,110,0.35)' },
          '50%': { boxShadow: '0 0 45px rgba(213,16,110,0.65)' },
        },
      },
    }
  },
  plugins: []
}
