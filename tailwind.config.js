/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // warm neutral canvas + one calm accent
        canvas: { DEFAULT: '#F6F5F2', dark: '#0E1116' },
        surface: { DEFAULT: '#FFFFFF', dark: '#161B22' },
        line: { DEFAULT: '#E6E3DD', dark: '#262D37' },
        ink: { DEFAULT: '#1F2328', soft: '#57606A', dark: '#E6EDF3', softdark: '#9DA7B3' },
        accent: { DEFAULT: '#4F46E5', soft: '#EEF0FF', dark: '#8B93FF', softdark: '#1E2147' },
      },
      boxShadow: { card: '0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)' },
    },
  },
  plugins: [],
}
