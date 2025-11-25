/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    hover: 'hsl(var(--primary-hover))',
                },
                secondary: 'hsl(var(--secondary))',
                'dark-bg': 'hsl(var(--dark-bg))',
                'dark-surface': 'hsl(var(--dark-surface))',
                'dark-border': 'hsl(var(--dark-border))',
                'message-sent': 'hsl(var(--message-sent))',
                'message-received': 'hsl(var(--message-received))',
                success: 'hsl(var(--success))',
                warning: 'hsl(var(--warning))',
                error: 'hsl(var(--error))',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            }
        },
    },
    plugins: [],
}
