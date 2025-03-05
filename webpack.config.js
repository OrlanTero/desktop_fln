const path = require('path');
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './src/renderer.js',
  output: {
    path: path.resolve(__dirname, '.webpack/main'),
    filename: 'renderer.js',
  },
  module: {
    rules: [
      ...rules,
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
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
    extensions: ['.js', '.jsx', '.json', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'process/browser': require.resolve('process/browser'),
    },
    fallback: {
      path: false,
      fs: false,
      crypto: false,
      process: require.resolve('process/browser'),
    },
  },
  devtool: 'source-map',
}; 