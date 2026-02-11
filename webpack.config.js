const path = require("path");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkerPlugin = require("worker-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

let publicUrl = process.env.PUBLIC_URL || "/";
if (!publicUrl.endsWith("/")) {
  publicUrl += "/";
}

const scratchStaticAssetDir = path.resolve(
  __dirname,
  "node_modules/@scratch/scratch-gui/dist/static",
)

const scratchChunkDir = path.resolve(
  __dirname,
  "node_modules/@scratch/scratch-gui/dist/chunks",
)

module.exports = {
  entry: {
    "web-component": path.resolve(__dirname, "./src/web-component.js"),
    scratch: path.resolve(__dirname, "./src/scratch.jsx"),
    PyodideWorker: path.resolve(__dirname, "./src/PyodideWorker.js"),
  },
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
    ],
  },
  resolve: {
    extensions: [".*", ".js", ".jsx", ".css"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      path: require.resolve("path-browserify"),
      url: require.resolve("url/"),
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
    static: [
      {
        directory: path.join(__dirname, "public"),
      },
      {
        directory: path.join(__dirname, "src", "projects"),
        publicPath: `${publicUrl}projects`,
      },
      {
        directory: scratchStaticAssetDir,
        publicPath: `${publicUrl}scratch-gui/static`,
      },
      {
        directory: scratchChunkDir,
        publicPath: `${publicUrl}scratch-gui/chunks`,
      }
    ],
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
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/web-component.html",
      filename: "web-component.html",
      chunks: ["web-component"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: scratchStaticAssetDir, to: "scratch-gui/static" },
        { from: scratchChunkDir, to: "scratch-gui/chunks" },
        { from: "public", to: "" },
        { from: "src/projects", to: "projects" },
      ],
    }),
  ],
  stats: "minimal",
};
