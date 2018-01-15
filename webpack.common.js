const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanCSSPlugin = require('less-plugin-clean-css');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');

const production = process.env.NODE_ENV === 'production';

const extractLess = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  disable: !production,
});

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'react'],
            plugins: [
              'transform-object-rest-spread',
              'transform-class-properties',
            ],
          },
        },
      },
      {
        test: /\.less$/,
        use: extractLess.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: !production,
              },
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: !production,
                plugins: production
                  ? [
                      new CleanCSSPlugin({ advanced: true }),
                      new LessPluginAutoPrefix({
                        browsers: ['last 2 versions'],
                      }),
                    ]
                  : [],
              },
            },
          ],
          fallback: 'style-loader',
        }),
      },
    ],
  },
  plugins: [extractLess, new HtmlWebpackPlugin({ template: 'template.html' })],
};
