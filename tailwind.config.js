/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fcf3f3',
                    100: '#f8e4e4',
                    200: '#f1cdcd',
                    300: '#e5abab',
                    400: '#d57b7b',
                    500: '#c25151',
                    600: '#ab3939',
                    700: '#8f2c2c', // Maroon base
                    800: '#772727',
                    900: '#642424',
                    950: '#351010',
                },
                secondary: {
                    50: '#fdfae9',
                    100: '#fbf3c8',
                    200: '#f7e793',
                    300: '#f1d454',
                    400: '#ecc42c',
                    500: '#e0b215', // Gold base
                    600: '#c08b10',
                    700: '#996311',
                    800: '#7f4f16',
                    900: '#6c4118',
                    950: '#3e2109',
                },
                cream: {
                    DEFAULT: '#FDFBF7',
                    50: '#ffffff',
                    100: '#fdfbf7',
                    200: '#f8f4e9',
                    300: '#f2e9d5',
                    400: '#ebdabt',
                    500: '#e1c8a1',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'premium': '0 10px 40px -4px rgba(143, 44, 44, 0.08)',
            }
        },
    },
    plugins: [],
}
