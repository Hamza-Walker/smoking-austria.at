// webpack.config.js
const webpack = require('webpack')

module.exports = {
  // other config
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
    store: 'pack',
  },
  // additional configuration
}
