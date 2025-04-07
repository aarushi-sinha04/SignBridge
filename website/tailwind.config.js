/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': 'rgba(20, 20, 35, 0.7)',
        'bg-tertiary': 'rgba(30, 30, 50, 0.5)',
        'accent-primary': '#6e56cf',
        'accent-secondary': '#c4b5fd',
        'accent-glow': 'rgba(110, 86, 207, 0.5)',
        'text-primary': '#ffffff',
        'text-secondary': 'rgba(255, 255, 255, 0.85)',
        'text-muted': 'rgba(255, 255, 255, 0.6)',
        'border': 'rgba(255, 255, 255, 0.1)',
        'success': '#4ecca3',
        'danger': '#ff6b6b',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
        'shine': 'shine 3s linear infinite',
        'pulse': 'pulse 1s ease-in-out infinite',
        'wordPulse': 'wordPulse 1s ease-in-out infinite',
        'cardAppear': 'cardAppear 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        wordPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(110, 86, 207, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(110, 86, 207, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(110, 86, 207, 0)' },
        },
        cardAppear: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(8px)',
      },
    },
  },
  plugins: [],
} 