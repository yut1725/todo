/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B1520',
          900: '#0F1B2B',
          800: '#16283D',
          700: '#1E3348',
          600: '#2A4560',
        },
        mist: {
          400: '#5B7286',
          300: '#8CA0B3',
          200: '#B9C7D3',
          100: '#EAF0F5',
        },
        ember: {
          DEFAULT: '#F2A65A',
          soft: '#F7C989',
        },
        alert: {
          DEFAULT: '#E2574C',
          soft: '#F09088',
        },
        calm: {
          DEFAULT: '#4FA3A0',
          soft: '#7FC4C1',
        },
        done: {
          DEFAULT: '#5FBF8F',
          soft: '#8FD8B2',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        thai: ['"IBM Plex Sans Thai"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
