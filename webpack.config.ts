const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
import path from 'path';
import { theme } from './src/style/themes/main';
const sass = require('sass');
const sassUtils = require('node-sass-utils')(sass);

module.exports = {
  mode: 'development',
  entry: [
    './src/main.tsx',
    './src/style/main.scss'
  ],
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
      }, {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: '.',
              name: '[name].css',
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                functions: {
                  "get($keys)": function(_keys: any) {
                    const keys = _keys.getValue().split(".");
                    let result: any = theme;
                    let i;
                    for (i = 0; i < keys.length; i++) {
                      result = result[keys[i]];
                    }
                    result = sassUtils.castToSass(result);
                    return result;
                  }
                },
              }
            }
          }
        ]
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
  }),],
};