const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      path: require.resolve('path-browserify'),
      fs: false,
      child_process: false,
      crypto: false,
      os: false,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      events: require.resolve('events/'),
    },
  },
  devtool: 'source-map',
  target: 'web',
}; 