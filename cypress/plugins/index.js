// const injectDevServer = require("@cypress/react/plugins/react-scripts")

module.exports = (on, config) => {
  if (config.testingType === 'component') {
    const { startDevServer } = require('@cypress/webpack-dev-server')

    // Your project's Webpack configuration
    const webpackConfig = require('../../webpack.config.dev.js')

    on('dev-server:start', (options) =>
      startDevServer({ options, webpackConfig })
    )
  }

  return config
}