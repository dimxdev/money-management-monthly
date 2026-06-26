/** @type {import('tailwindcss').Config} */

// Skala `slate` & `violet` diarahkan ke CSS variable (lihat src/index.css).
// Nilai variabel berbeda di light vs dark, jadi:
//   - Mode light  -> warna asli Tailwind (tidak berubah)
//   - Mode dark   -> palet "Midnight Aurora"
// Tanpa perlu mengubah class `dark:` di tiap komponen.
const cssVarScale = (name) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => [
      shade,
      `rgb(var(--${name}-${shade}) / <alpha-value>)`,
    ])
  )

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: cssVarScale('slate'),
        violet: cssVarScale('violet'),
        // dulu partner gradient ungu -> sekarang biru (Cosmic Blue) & teal
        indigo: cssVarScale('indigo'),
        purple: cssVarScale('purple'),
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
