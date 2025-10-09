/** @type {import('postcss-load-config').Config} */

const config = {
  plugins: [
    require('postcss-import'),
    require('postcss-nested'),
    require('autoprefixer')
  ]
};

module.exports = config;
