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
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out',
                'pulse-soft': 'pulseSoft 3s infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'neon': '0 0 10px theme("colors.primary"), 0 0 40px theme("colors.primary")',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
