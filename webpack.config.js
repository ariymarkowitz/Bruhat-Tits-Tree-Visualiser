const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.tsx',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.exec\.js$/,
        use: [ 'script-loader' ]
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    minimize: false
  },
  plugins: [new HtmlWebpackPlugin({
    title: 'Bruhat-Tits Tree',
    template: 'src/index.html',
    files: {
      js: [ "dist/bundle.js"],
    }
  }),
  new CopyPlugin({
    patterns: [
      { from: "src/style", to: "." },
    ],
  }),],
};