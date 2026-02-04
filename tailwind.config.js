/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'rocket-launch': {
          '0%': {
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)',
            opacity: '1',
          },
          '55%': {
            transform: 'translateY(-45px) scale(1.05)',
            filter: 'blur(1px)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(-160px) scale(1.2)',
            filter: 'blur(3px)',
            opacity: '0',
          },
        },
        'splash-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'rocket-launch': 'rocket-launch 1.4s ease-in forwards',
        'splash-fade-in': 'splash-fade-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
