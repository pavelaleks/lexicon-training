/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['1rem', { lineHeight: '1.75' }],
        lead: ['1.125rem', { lineHeight: '1.8' }],
      },
      minHeight: {
        tap: '44px',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom, 0px)',
      },
      maxWidth: {
        prose: '65ch',
      },
      colors: {
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          muted: 'var(--color-accent-muted)',
        },
      },
    },
  },
  plugins: [],
};
