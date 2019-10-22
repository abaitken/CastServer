const path = require('path');

module.exports = {
  entry: './viewmodel.js',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../static')
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
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