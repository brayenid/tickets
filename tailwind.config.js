/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./node_modules/flowbite/**/*.js', './src/views/**/*.handlebars'],
  theme: {
    screens: {
      sm: '480px',
      smd: '612px',
      md: '768px',
      mlg: '800px',
      lg: '976px',
      mxl: '1200px',
      xl: '1440px'
    },
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#7edce2',
          400: '#16bdca',
          500: '#0694a2',
          600: '#047481',
          700: '#036672',
          800: '#05505c',
          900: '#014451',
          950: '#042f2e'
        }
      }
    }
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('flowbite/plugin')({
      charts: true
    })
  ]
}
