import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0066CC',
        'secondary-teal': '#20B2AA',
        'success-green': '#28A745',
        'neutral-dark': '#1F2937',
        'neutral-light': '#F3F4F6',
        'warning-orange': '#FF9800',
        'candidate-purple': '#9C27B0',
      },
    },
  },
  plugins: [],
} satisfies Config
