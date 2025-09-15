/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // Enable dark mode based on class
  theme: {
    extend: {
      colors: {
        // Light Mode Colors
        light: {
          background: '#F9FAFB',
          primary: '#1F2937',
          secondary: '#374151',
          accent: '#2563EB',
          success: '#10B981',
          error: '#EF4444',
          border: '#D1D5DB',
          input: '#FFFFFF'
        },
        // Dark Mode Colors
        dark: {
          background: '#111827',
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          accent: '#3B82F6',
          success: '#34D399',
          error: '#F87171',
          border: '#374151',
          input: '#1F2937'
        }
      }
    },
  },
  plugins: [],
}
