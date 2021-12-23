module.exports = {
  content: [
    "./components/**/*.tsx",
    "./static/*.*"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "white": "#ffffff",
      },
    },
  },
  plugins: [
    require('postcss-import'),
  ],
}
