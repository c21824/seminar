/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f1726',
        panel: '#f8fafc',
        card: '#ffffff',
        lineSoft: '#d7e0ec',
        lineStrong: '#c5d3e2',
        textStrong: '#122033',
        textMuted: '#587089',
        brandCyan: '#0ea5b7',
        brandCoral: '#f08a5d',
        brandBlue: '#1f3b73',
        ok: '#1c9a64',
        danger: '#d84b4b',
      },
      fontFamily: {
        heading: ['Sora', 'Segoe UI', 'sans-serif'],
        body: ['Manrope', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 16px 40px rgba(15, 23, 38, 0.12)',
        card: '0 8px 24px rgba(17, 35, 64, 0.09)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
      keyframes: {
        riseIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        riseIn: 'riseIn 380ms ease both',
      },
    },
  },
  plugins: [],
}
