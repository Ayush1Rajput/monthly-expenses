/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0A0A0C',
          900: '#131317',
          850: '#19191F',
          800: '#212129',
        },
        parchment: {
          50: '#FFFDF8',
          100: '#F3EFE6',
          200: '#E7E1D3',
          300: '#D6CEBC',
        },
        limeSignal: {
          DEFAULT: '#C8FF2E',
          dark: '#9ED400',
          deep: '#16794B',
        },
        vermilion: {
          DEFAULT: '#FF4D3D',
          dark: '#E03424',
          soft: '#FF7A6E',
        },
        cobalt: {
          DEFAULT: '#7C7CFF',
          dark: '#5555E6',
        },
        marigold: {
          DEFAULT: '#FFB830',
        }
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      }
    },
  },
  plugins: [],
}
