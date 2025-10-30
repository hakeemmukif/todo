/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Hack', 'Fira Code', 'SF Mono', 'Menlo', 'Courier New', 'monospace'],
      },
      colors: {
        minimal: {
          bg: '#FAFAFA',
          text: '#0A0A0A',
          border: '#E0E0E0',
          accent: '#4A90E2',
          hover: '#F5F5F5',
          urgent: '#CC0000',
          blocked: '#FF9800',
        },
      },
      spacing: {
        '15': '3.75rem',
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
