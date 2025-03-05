module.exports = {
  entry: './src/preload.js',
  module: {
    rules: require('./webpack.rules'),
  },
  externals: {
    'electron': 'commonjs electron',
    'nodemailer': 'commonjs nodemailer',
    'net': 'commonjs net',
    'tls': 'commonjs tls',
    'dns': 'commonjs dns'
  }
}; 