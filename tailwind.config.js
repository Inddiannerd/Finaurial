/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#f9f9f6',
        forest: '#0f1f1a',
        'brand-green': '#14B8A6',
        'brand-red': '#EF4444',
        'brand-blue': '#3B82F6',
        light: {
          background: 'var(--color-paper)',
          card: '#ffffff',
          text: {
            primary: '#0f1f1a',
            secondary: '#374151',
          },
          border: 'var(--color-brand-green)',
          accent: 'var(--color-brand-green)',
          success: 'var(--color-brand-green)',
          error: 'var(--color-brand-red)',
          info: 'var(--color-brand-blue)',
        },
        dark: {
          background: 'var(--color-forest)',
          card: '#111827',
          text: {
            primary: '#f9f9f6',
            secondary: '#9CA3AF',
          },
          border: 'var(--color-brand-green)',
          accent: 'var(--color-brand-green)',
          success: '#34D399', // Neon Green
          error: '#F87171',   // Neon Red
          info: '#5E81AC',      // Neon Blue
        },
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px -2px', opacity: 0.8 },
          '50%': { boxShadow: '0 0 10px 0px', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        glow: 'glow 2.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}