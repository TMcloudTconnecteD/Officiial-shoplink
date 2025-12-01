import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFD93D',
        background: '#F7FFF7',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
});
