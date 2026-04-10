const path = require("path");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkerPlugin = require("worker-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

let publicUrl = process.env.PUBLIC_URL || "/";
if (!publicUrl.endsWith("/")) {
  publicUrl += "/";
}

const scratchStaticDir = path.resolve(
  __dirname,
  "node_modules/@scratch/scratch-gui/dist/static",
);

const scratchChunkDir = path.resolve(
  __dirname,
  "node_modules/@scratch/scratch-gui/dist/chunks",
);

const moduleRules = [
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
    "web-component": path.resolve(__dirname, "./src/web-component.js"),
    PyodideWorker: path.resolve(__dirname, "./src/PyodideWorker.js"),
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
      {
        directory: scratchStaticDir,
        publicPath: `${publicUrl}scratch-gui/static`,
      },
      {
        directory: scratchChunkDir,
        publicPath: `${publicUrl}scratch-gui/chunks`,
      },
    ],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization, X-Project-ID",
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
          ].includes(req.url) ||
          req.url.startsWith("/scratch.html")
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
      template: "src/web-component.html",
      filename: "web-component.html",
      chunks: ["web-component"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: "" },
        { from: "src/projects", to: "projects" },
      ],
    }),
  ],
  stats: "minimal",
};

const scratchConfig = {
  entry: {
    scratch: path.resolve(__dirname, "./src/scratch.jsx"),
  },
  module: { rules: moduleRules },
  resolve: {
    extensions: [".*", ".js", ".jsx", ".css"],
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "[name].js",
    publicPath: publicUrl,
  },
  externals: [
    function ({ request }, callback) {
      if (request === "@scratch/scratch-gui") return callback(null, "GUI");
      if (request === "react") return callback(null, "React");
      if (request === "react-dom" || request.startsWith("react-dom/"))
        return callback(null, "ReactDOM");
      if (request === "redux") return callback(null, "Redux");
      if (request === "react-redux") return callback(null, "ReactRedux");
      callback();
    },
  ],
  plugins: [
    new Dotenv({
      path: "./.env",
      systemvars: true,
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/scratch.html",
      filename: "scratch.html",
      chunks: ["scratch"],
      templateParameters: {
        publicUrl: publicUrl,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: scratchStaticDir, to: "scratch-gui/static" },
        { from: `${scratchStaticDir}/assets`, to: "vendor/static/assets" },
        { from: scratchChunkDir, to: "chunks" },
        {
          from: "node_modules/react/umd/react.production.min.js",
          to: "vendor/react.production.min.js",
        },
        {
          from: "node_modules/react-dom/umd/react-dom.production.min.js",
          to: "vendor/react-dom.production.min.js",
        },
        {
          from: "node_modules/redux/dist/redux.min.js",
          to: "vendor/redux.min.js",
        },
        {
          from: "node_modules/react-redux/dist/react-redux.min.js",
          to: "vendor/react-redux.min.js",
        },
        {
          from: "node_modules/@scratch/scratch-gui/dist/scratch-gui.js",
          to: "vendor/scratch-gui.js",
        },
        {
          from: "node_modules/@scratch/scratch-gui/dist/scratch-gui.js.LICENSE.txt",
          to: "vendor/scratch-gui.js.LICENSE.txt",
        },
      ],
    }),
  ],
  stats: "minimal",
};

module.exports = [mainConfig, scratchConfig];
