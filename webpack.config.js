const path = require('path')
//is this file necessary?
module.exports = {
  resolve: {
    fallback: {
      assert: require.resolve('assert/'),
      url: require.resolve('url/'),
      os: require.resolve('os-browserify/browser'),
      fs: false,
      child_process: false,
    },
    alias: {
      dotenv: path.resolve(__dirname, './dotenv.js'),
      [path.resolve(__dirname, 'collections/Products/hooks/beforeChange')]: path.resolve(
        __dirname,
        './emptyModuleMock.js',
      ),
      [path.resolve(__dirname, 'collections/Users/hooks/createStripeCustomer')]: path.resolve(
        __dirname,
        './emptyModuleMock.js',
      ),
      [path.resolve(__dirname, 'collections/Users/endpoints/customer')]: path.resolve(
        __dirname,
        './emptyModuleMock.js',
      ),
      [path.resolve(__dirname, 'endpoints/create-payment-intent')]: path.resolve(
        __dirname,
        './emptyModuleMock.js',
      ),
      [path.resolve(__dirname, 'endpoints/customers')]: path.resolve(
        __dirname,
        './emptyModuleMock.js',
      ),
      [path.resolve(__dirname, 'endpoints/products')]: path.resolve(
        __dirname,
        './emptyModuleMock.js',
      ),
      [path.resolve(__dirname, 'endpoints/seed')]: path.resolve(__dirname, './emptyModuleMock.js'),
      stripe: path.resolve(__dirname, './emptyModuleMock.js'),
      express: path.resolve(__dirname, './emptyModuleMock.js'),
    },
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
}
