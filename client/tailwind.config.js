/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'glow-magenta': '#D5106E',
        'glow-purple': '#6E3992',
        'glow-pink':   '#FF6BAD',
        midnight:       '#05050A',
        'midnight-2':   '#0A0A15',
        'midnight-3':   '#0F0F1A',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      dropShadow: {
        'neon-magenta': ['0 0 10px rgba(213,16,110,0.9)', '0 0 30px rgba(213,16,110,0.5)'],
        'neon-purple':  ['0 0 10px rgba(110,57,146,0.9)', '0 0 30px rgba(110,57,146,0.5)'],
        'neon-sm':       '0 0 8px rgba(213,16,110,0.7)',
        'neon-white':   ['0 0 10px rgba(255,255,255,0.9)', '0 0 30px rgba(255,255,255,0.3)'],
      },
      boxShadow: {
        'glow-magenta':    '0 0 25px rgba(213,16,110,0.45), 0 0 60px rgba(213,16,110,0.18)',
        'glow-magenta-lg': '0 0 40px rgba(213,16,110,0.65), 0 0 90px rgba(213,16,110,0.28)',
        'glow-purple':     '0 0 25px rgba(110,57,146,0.45), 0 0 60px rgba(110,57,146,0.18)',
        'glass':           '0 8px 32px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)',
        'card':            '0 4px 24px rgba(0,0,0,0.6)',
        'neon-border':     '0 0 0 1px rgba(213,16,110,0.55), 0 0 20px rgba(213,16,110,0.2)',
      },
      animation: {
        'float':       'floatY 6s ease-in-out infinite',
        'float-slow':  'floatY 11s ease-in-out infinite',
        'glow-pulse':  'glowPulse 2.5s ease-in-out infinite',
        'shimmer':     'shimmer 2.5s linear infinite',
        'ticker':      'ticker 35s linear infinite',
        'aurora-1':    'aurora1 18s ease-in-out infinite',
        'aurora-2':    'aurora2 23s ease-in-out infinite',
        'aurora-3':    'aurora3 14s ease-in-out infinite',
        'rotate-slow': 'spin 30s linear infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'pulse-ring':  'pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':       { transform: 'translateY(-20px) rotate(1.5deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(213,16,110,0.35)' },
          '50%':       { boxShadow: '0 0 55px rgba(213,16,110,0.8), 0 0 100px rgba(213,16,110,0.3)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        aurora1: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1) rotate(0deg)' },
          '33%':       { transform: 'translate(9%, -14%) scale(1.18) rotate(120deg)' },
          '66%':       { transform: 'translate(-6%, 10%) scale(0.88) rotate(240deg)' },
        },
        aurora2: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '25%':       { transform: 'translate(-12%, 8%) scale(1.22)' },
          '75%':       { transform: 'translate(8%, -10%) scale(0.82)' },
        },
        aurora3: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '50%':       { transform: 'translate(5%, -6%) scale(1.14)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(213,16,110,0.35)' },
          '50%':       { borderColor: 'rgba(213,16,110,0.9)' },
        },
        pulseRing: {
          '0%':         { transform: 'scale(1)',    opacity: '1' },
          '100%':       { transform: 'scale(1.8)',  opacity: '0' },
        },
      },
    }
  },
  plugins: [],
}
