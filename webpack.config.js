const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkerPlugin = require("worker-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

let publicUrl = process.env.PUBLIC_URL || "/";
if (!publicUrl.endsWith("/")) {
  publicUrl += "/";
}

module.exports = {
  entry: {
    "web-component": path.resolve(__dirname, "./src/web-component.js"),
    PyodideWorker: path.resolve(__dirname, "./src/PyodideWorker.js"),
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: [
          /node_modules\/scratch-gui/,
          /node_modules\/@scratch/, // Include @scratch packages
          /node_modules\/scratch-paint/, // Include scratch-paint
        ],
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
              ],
              plugins: [
                [
                  "prismjs",
                  {
                    languages: ["javascript", "css", "python", "html"],
                    plugins: [
                      "line-numbers",
                      "line-highlight",
                      "highlight-keywords",
                      "normalize-whitespace",
                    ],
                    theme: "twilight",
                    css: true,
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!scratch-gui|@scratch|scratch-paint)/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [
                [
                  "prismjs",
                  {
                    languages: ["javascript", "css", "python", "html"],
                    plugins: [
                      "line-numbers",
                      "line-highlight",
                      "highlight-keywords",
                      "normalize-whitespace",
                    ],
                    theme: "twilight",
                    css: true,
                  },
                ],
              ],
            },
          },
        ],
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
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.md$/,
        use: ["raw-loader"],
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
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: "url-loader",
          },
        ],
      },
      {
        test: /\.mp3$/,
        include: /node_modules\/scratch-gui/,
        type: "asset/resource",
        generator: {
          filename: "static/media/[name].[hash][ext]",
        },
      },
      {
        test: /\.wav$/,
        include: /node_modules\/scratch-gui/,
        type: "asset/resource",
        generator: {
          filename: "static/media/[name].[hash][ext]",
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        include: /node_modules\/scratch-gui/,
        type: "asset/resource",
        generator: {
          filename: "static/media/[name].[hash][ext]",
        },
      },
      // Handle arrayBuffer imports specifically
      {
        test: /\.(mp3|wav)$/,
        include: /node_modules\/scratch-gui/,
        resourceQuery: /arrayBuffer/,
        type: "asset/resource",
        generator: {
          filename: "static/media/[name].[hash][ext]",
        },
      },
      {
        test: /\.hex$/,
        include: /node_modules\/scratch-gui/,
        type: "asset/resource",
        generator: {
          filename: "static/firmware/[name].[hash][ext]",
        },
      },
    ],
  },
  resolve: {
    extensions: [".*", ".js", ".jsx", ".css", ".ts", ".tsx"], // Add .ts and .tsx
    alias: {
      "scratch-gui": path.resolve(
        __dirname,
        "node_modules/scratch-gui/packages/scratch-gui/src/index.ts", // Point to index.ts
      ),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-redux": path.resolve(__dirname, "node_modules/react-redux"),
    },
    fallback: {
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      path: require.resolve("path-browserify"),
      url: require.resolve("url/"),
      buffer: require.resolve("buffer"),
    },
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "[name].js",
    publicPath: publicUrl,
    workerPublicPath: publicUrl,
  },
  devServer: {
    host: "0.0.0.0",
    allowedHosts: "all",
    port: 3011,
    liveReload: true,
    hot: false,
    static: {
      directory: path.join(__dirname, "public"),
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
      // Pyodide - required for input and code interruption - needed on the host app
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.use((req, res, next) => {
        // PyodideWorker scripts - cross origin required on scripts needed for importScripts
        if (
          [
            "/pyodide/shims/_internal_sense_hat.js",
            "/pyodide/shims/pygal.js",
            "/PyodideWorker.js",
          ].includes(req.url)
        ) {
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        }
        next();
      });
      return middlewares;
    },
  },
  plugins: [
    new WorkerPlugin(),
    new Dotenv({
      path: "./.env",
      systemvars: true,
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/web-component.html",
      filename: "web-component.html",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "" }],
    }),
  ],
  stats: "minimal",
};
