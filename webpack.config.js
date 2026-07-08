const path = require("path");
const dotenv = require("dotenv");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkerPlugin = require("worker-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

dotenv.config({ path: path.resolve(__dirname, ".env") });

let publicUrl = process.env.PUBLIC_URL || "/";
if (!publicUrl.endsWith("/")) {
  publicUrl += "/";
}

const moduleRules = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: ["babel-loader"],
  },
  {
    test: /\.js$/,
    include:
      /node_modules\/@raspberrypifoundation\/python-friendly-error-messages/,
    resolve: { fullySpecified: false },
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
          api: "modern",
          sassOptions: {
            loadPaths: [path.resolve(__dirname, "node_modules")],
          },
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
    test: /cc-wallpaper\.svg$/,
    use: [
      {
        loader: "url-loader",
        options: {
          limit: 100000,
        },
      },
    ],
  },
  {
    test: /\.svg$/,
    exclude: [/\/src\/assets\/icons\/.*\.svg$/, /cc-wallpaper\.svg$/],
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
];

const mainConfig = {
  entry: {
    "web-component": path.resolve(__dirname, "./src/web-component.jsx"),
    PyodideWorker: path.resolve(__dirname, "./src/PyodideWorker.js"),
    "html-renderer": path.resolve(__dirname, "./src/html-renderer.jsx"),
  },
  module: { rules: moduleRules },
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
    ],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization, x-run-id, x-project-id",
      // Pyodide - required for input and code interruption - needed on the host app
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.use((req, res, next) => {
        if (
          [
            "/pyodide/shims/_internal_sense_hat.js",
            "/pyodide/shims/pygal.js",
            "/PyodideWorker.js",
            "/api/scratch/projects/cool-scratch.json",
          ].includes(req.url) ||
          req.url.startsWith("/html-renderer.html")
        ) {
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        }
        next();
      });
      return middlewares;
    },
  },
  plugins: [
    process.env.ANALYZE_WEBPACK_BUNDLE && new BundleAnalyzerPlugin(),
    new WorkerPlugin(),
    new Dotenv({
      path: "./.env",
      systemvars: true,
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "web-component.html",
      filename: "web-component.html",
      chunks: ["web-component"],
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "html-renderer.html",
      filename: "html-renderer.html",
      chunks: ["html-renderer"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: "" },
        { from: "src/projects", to: "projects" },
        {
          from: "node_modules/@raspberrypifoundation/python-friendly-error-messages/copydecks",
          to: "python-error-copydecks",
        },
      ],
    }),
  ],
  stats: "minimal",
};

module.exports = [mainConfig];
