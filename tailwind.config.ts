import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#070707', 2: '#0e0e0e', 3: '#161616', 4: '#1e1e1e', 5: '#272727' },
        gold: { DEFAULT: '#c8a45a', 2: '#e0c078', 3: '#f2d898', dim: '#7a5f28' },
        border: { DEFAULT: '#222222', 2: '#2e2e2e' },
        ink: { DEFAULT: '#eeebe4', 2: '#9e9a93', 3: '#5c5a55' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '20px' },
      boxShadow: {
        gold: '0 0 30px rgba(200,164,90,0.08), 0 0 60px rgba(200,164,90,0.04)',
        panel: '0 4px 32px rgba(0,0,0,0.6)',
        card: '0 2px 16px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c8a45a, #7a5f28)',
        'dark-gradient': 'linear-gradient(180deg, #0e0e0e, #070707)',
      },
    },
  },
  plugins: [],
}
export default config
