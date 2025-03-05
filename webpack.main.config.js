const path = require('path');
const webpack = require('webpack');
const plugins = require('./webpack.plugins');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  externals: {
    'nodemailer': 'commonjs nodemailer',
    'net': 'commonjs net',
    'tls': 'commonjs tls',
    'dns': 'commonjs dns'
  },
  plugins: [
    ...plugins,
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'process/browser': require.resolve('process/browser'),
    },
    fallback: {
      process: require.resolve('process/browser'),
    },
  },
  output: {
    path: path.join(__dirname, '.webpack/main'),
    filename: 'index.js',
  },
  experiments: {
    topLevelAwait: true
  }
}; 