const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // context: __dirname,
  entry: path.resolve(__dirname, './src/index.js'),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        // exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: [
          'css-loader',
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      }
    ]
  },
  // resolve: {
  //   extensions: ['*', '.js', '.jsx', '.css']
  // },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'index.js',
    publicPath: '/',
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    historyApiFallback: true
  },
  plugins: [
    new Dotenv({
      path: './.env',
      systemvars: true
    }),
    new HtmlWebpackPlugin({
      template: path.resolve( __dirname, 'src/index.html' ),
      filename: 'index.html'
    }),
    new webpack.ProvidePlugin({
      'React': 'react'
    })
  ]
};
