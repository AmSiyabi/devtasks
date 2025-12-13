/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // <--- New Font
      },
      colors: {
        vscode: {
          bg: '#18181b',         // Zinc-950 (Deep, rich dark)
          sidebar: '#27272a',    // Zinc-800 (Lighter panel)
          activity: '#18181b',   // Same as bg, blends in
          itemHover: '#3f3f46',  // Zinc-700
          itemActive: '#2563eb', // Modern Blue (Tailwind Blue-600)
          border: '#3f3f46',     // Zinc-700 (Subtle borders)
          accent: '#3b82f6',     // Blue-500
          text: '#e4e4e7',       // Zinc-200 (High contrast text)
          textMuted: '#a1a1aa'   // Zinc-400
        }
      }
    },
  },
  plugins: [
     require('@tailwindcss/typography'), 
  ],
}