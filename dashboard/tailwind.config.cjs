/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(2 132 199 / <alpha-value>)',
        secondary: 'rgb(14 165 233 / <alpha-value>)',
        accent: 'rgb(56 189 248 / <alpha-value>)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    logs: false,
    themes: [
      {
        default: {
          primary: 'rgb(2 132 199)',
          secondary: 'rgb(14 165 233)',
          accent: 'rgb(56 189 248)',
          neutral: '#191D24',
          'base-100': '#2A303C',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
        },
      },
    ],
  },
};
