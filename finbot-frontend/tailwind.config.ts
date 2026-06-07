import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F0E8',
          dark: '#EDE8DC',
          border: '#D4C9B4',
          deep: '#C8BCA8',
        },
        ink: {
          DEFAULT: '#1A1410',
          light: '#6B5E4E',
          muted: '#9C8E7E',
        },
        vermilion: {
          DEFAULT: '#CC3300',
          light: '#E84422',
          dark: '#A32900',
        },
        ledger: {
          green: '#1A5C3A',
        },
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
