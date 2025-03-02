const { ForkTsCheckerWebpackPlugin } = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

module.exports = [
  // Add plugins here if needed
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
    process: 'process/browser',
  }),
]; 