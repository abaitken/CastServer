
module.exports = {
  entry: './js/viewmodel.js',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: __dirname
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};