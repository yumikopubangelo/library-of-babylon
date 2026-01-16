import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        babylon: {
          lapis: {
            950: '#0a0e17',
            900: '#101828',
            800: '#1e2b45',
          },
          gold: {
            600: '#aa8c2c',
            500: '#d4af37',
            400: '#e5c158',
          },
          sand: {
            200: '#e6dec8',
            100: '#f3f0e6',
          },
          clay: {
            500: '#c27ba0',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out forwards',
        'fade-in-up': 'fade-in-up 1s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
