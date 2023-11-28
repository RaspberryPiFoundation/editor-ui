const path = require("path");
const webpack = require('webpack')
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "./src/web-component.js"),
  cache: false,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [
          "sass-to-string",
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                outputStyle: "compressed",
              },
            },
          },
        ],
      },
      {
        test: /\/src\/assets\/icons\/.*\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              esModule: false,
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        exclude: /\/src\/assets\/icons\/.*\.svg$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".*", ".js", ".jsx", ".css"],
    fallback: { 
      path: require.resolve("path-browserify")
    }
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "web-component.js",
  },
  devServer: {
    allowedHosts: ["react-ui-test-wc"],
    contentBase: path.join(__dirname, "public"),
    index: "web-component.html",
    host: "0.0.0.0",
    disableHostCheck: true,
    port: 3001,
    writeToDisk: true,
  },
  plugins: [
    new Dotenv({
      path: "./.env.webcomponent",
      systemvars: true,
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/web-component.html",
      filename: "web-component.html",
    }),
    // fix "process is not defined" error:
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
    }),
  ],
};
