import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFD93D',
        background: '#F7FFF7',
        soft: '#fafafa',
        stone: '#e9e9e9',
        ink: '#1a1a1a',
        glass: 'rgba(255,255,255,0.55)',
        jet: 'rgba(0,0,0,0.45)',
      },

      spacing: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },

      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
        bubble: '2.5rem',
      },

      boxShadow: {
        soft: '0 4px 18px rgba(0,0,0,0.08)',
        medium: '0 8px 30px rgba(0,0,0,0.12)',
        floating: '0 12px 40px rgba(0,0,0,0.15)',
      },

      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },

        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(70px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(70px) rotate(-360deg)' },
        },
        orbitSlow: {
          '0%': { transform: 'rotate(0deg) translateX(90px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(90px) rotate(-360deg)' },
        },
        orbitFast: {
          '0%': { transform: 'rotate(0deg) translateX(50px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(50px) rotate(-360deg)' },
        },
      },

      animation: {
        floatUp: 'floatUp .5s ease-in-out',
        pop: 'pop .2s ease-out',
        fadeIn: 'fadeIn .6s ease-out',

        orbit: 'orbit 3s linear infinite',
        orbitSlow: 'orbitSlow 5s linear infinite',
        orbitFast: 'orbitFast 2s linear infinite',
      },
    },
  },

  plugins: [],
});
