const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './viewmodel.js',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../static')
  },
  plugins: [
    new CopyPlugin([
      { from: path.resolve(__dirname, 'index.html'), to: path.resolve(__dirname, '../static') },
    ]),
  ],
  module: {
    rules: [
      { test: /\.html$/, use: [ "html-loader" ] },
      {
        test: /\.s?css$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif|woff2?|ttf|eot)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
};