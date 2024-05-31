const path = require("path");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkerPlugin = require("worker-plugin");

module.exports = {
  entry: path.resolve(__dirname, "./src/web-component.js"),
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
        exclude: [/node_modules/],
        use: [
          {
            loader: "css-loader",
          },
          {
            loader: "resolve-url-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                sourceMap: true,
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
    extensions: ["*", ".js", ".jsx", ".css"],
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "web-component.js",
  },
  devServer: {
    allowedHosts: ["react-ui-test-wc"],
    host: "0.0.0.0",
    allowedHosts: "all",
    port: 3001,
    devMiddleware: {
      index: "web-component.html",
      writeToDisk: true,
    },
    static: {
      directory: path.join(__dirname, "public"),
    },
  },
  plugins: [
    new WorkerPlugin(),
    new Dotenv({
      path: "./.env.webcomponent",
      systemvars: true,
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/web-component.html",
      filename: "web-component.html",
    }),
  ],
    stats: "minimal",
};
