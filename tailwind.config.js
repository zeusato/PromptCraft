/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./features/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--c-background) / <alpha-value>)',
                surface: 'rgb(var(--c-surface) / <alpha-value>)',
                primary: 'rgb(var(--c-primary) / <alpha-value>)',
                'primary-hover': 'rgb(var(--c-primary-hover) / <alpha-value>)',
                secondary: 'rgb(var(--c-secondary) / <alpha-value>)',
                accent: 'rgb(var(--c-accent) / <alpha-value>)',
                border: 'rgb(var(--c-border) / <alpha-value>)',
                main: 'rgb(var(--c-main) / <alpha-value>)',
                muted: 'rgb(var(--c-muted) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Keep Inter for clean UI
                heading: ['Outfit', 'sans-serif'], // Optional for headers if we add it
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out',
                'pulse-glow': 'pulseGlow 2s infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                }
            },
            boxShadow: {
                'neon': '0 0 5px theme("colors.primary"), 0 0 20px theme("colors.primary")',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            backgroundImage: {
                'cosmic-gradient': 'linear-gradient(to bottom right, #030712, #1e1b4b)',
            }
        },
    },
    plugins: [],
}
