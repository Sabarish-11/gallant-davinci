/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fe',
          100: '#e9effd',
          200: '#ccd9fb',
          300: '#9db4f7',
          400: '#6485f2',
          500: '#3f5eec',
          600: '#2741e1',
          700: '#1e2ecb',
          800: '#1e27a5',
          900: '#1d2683',
          950: '#111551',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(17, 24, 39, 0.05)',
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 20px 40px -5px rgba(0, 0, 0, 0.12), 0 8px 16px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
