/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          black: '#000000',
          white: '#ffffff',
          yellow: '#ffff00',
          pink: '#ff00ff',
          cyan: '#00ffff',
          green: '#00ff00',
          red: '#ff0000',
          blue: '#0000ff',
          orange: '#ff8800',
        },
        stellar: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        }
      },
      fontFamily: {
        'neo': ['Space Grotesk', 'sans-serif'],
        'neo-mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neo': '8px 8px 0px #000000',
        'neo-lg': '12px 12px 0px #000000',
        'neo-xl': '16px 16px 0px #000000',
        'neo-sm': '4px 4px 0px #000000',
      },
      rotate: {
        'neo-1': '1deg',
        'neo-2': '2deg',
        'neo-3': '3deg',
        'neo--1': '-1deg',
        'neo--2': '-2deg',
        'neo--3': '-3deg',
      }
    },
  },
  plugins: [],
}