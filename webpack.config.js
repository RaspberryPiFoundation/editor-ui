const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkerPlugin = require("worker-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const {
  getScratchChunkDir,
  getScratchCopyPatterns,
  getScratchStaticDir,
  mainCopyPatterns,
} = require("./config/buildArtifacts");
const {
  crossOriginHeaders,
  setCrossOriginResourcePolicy,
} = require("./config/devServerSecurity");
const {
  getScratchTemplateParameters,
} = require("./src/utils/scratchTemplateConfig.cjs");

dotenv.config({ path: path.resolve(__dirname, ".env") });

let publicUrl = process.env.PUBLIC_URL || "/";
if (!publicUrl.endsWith("/")) {
  publicUrl += "/";
}
const scratchStaticDir = getScratchStaticDir(__dirname);
const scratchChunkDir = getScratchChunkDir(__dirname);
const scratchTemplateParameters = getScratchTemplateParameters({
  assetsUrl: process.env.ASSETS_URL,
  cspApiMultipleOrigins: process.env.CSP_API_MULTIPLE_ORIGINS,
  nodeEnv: process.env.NODE_ENV,
  publicUrl,
  reactAppApiEndpoint: process.env.REACT_APP_API_ENDPOINT,
});
const runtimeEnvValues = Object.keys(process.env)
  .filter(
    (key) =>
      key.startsWith("REACT_APP_") ||
      ["ASSETS_URL", "HTML_RENDERER_URL", "PUBLIC_URL"].includes(key),
  )
  .reduce(
    (values, key) => ({
      ...values,
      [key]: process.env[key],
    }),
    { NODE_ENV: process.env.NODE_ENV || "development" },
  );
const runtimeEnvPlugin = new webpack.DefinePlugin({
  __RUNTIME_ENV__: JSON.stringify(runtimeEnvValues),
});

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
    "web-component": path.resolve(__dirname, "./src/web-component.js"),
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
      {
        directory: scratchStaticDir,
        publicPath: `${publicUrl}scratch-gui/static`,
      },
      {
        directory: scratchChunkDir,
        publicPath: `${publicUrl}scratch-gui/chunks`,
      },
    ],
    headers: crossOriginHeaders,
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.use(setCrossOriginResourcePolicy);
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
    runtimeEnvPlugin,
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/web-component.html",
      filename: "web-component.html",
      chunks: ["web-component"],
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/index-html-renderer.html",
      filename: "html-renderer.html",
      chunks: ["html-renderer"],
    }),
    new CopyWebpackPlugin({ patterns: mainCopyPatterns }),
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
      if (request === "@RaspberryPiFoundation/scratch-gui")
        return callback(null, "GUI");
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
    runtimeEnvPlugin,
    new HtmlWebpackPlugin({
      inject: "body",
      template: "src/scratch.html",
      filename: "scratch.html",
      chunks: ["scratch"],
      templateParameters: scratchTemplateParameters,
    }),
    new CopyWebpackPlugin({
      patterns: getScratchCopyPatterns({ scratchStaticDir, scratchChunkDir }),
    }),
  ],
  stats: "minimal",
};

module.exports = [mainConfig, scratchConfig];
