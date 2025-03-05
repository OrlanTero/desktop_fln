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
      process: require.resolve('process/browser'),
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'global': 'window',
      'process.env': JSON.stringify(process.env),
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'process/browser': require.resolve('process/browser'),
      'canvas': false,
      'canvg': path.resolve(__dirname, 'node_modules/canvg/lib/index.es.js'),
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
      process: require.resolve('process/browser'),
      zlib: require.resolve('browserify-zlib'),
    },
  },
  devtool: 'source-map',
  target: 'web',
}; 