module.exports = {
  content: ["./components/**/*.tsx"],
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
