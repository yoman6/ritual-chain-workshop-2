/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: '#6366f1', dark: '#4f46e5' },
        blue:   { DEFAULT: '#3b82f6' },
        rose:   { DEFAULT: '#f43f5e' },
        amber:  { DEFAULT: '#f59e0b' },
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body:    ['var(--font-body)'],
        mono:    ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
}
