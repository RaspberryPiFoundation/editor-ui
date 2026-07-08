const fs = require("fs");
const path = require("path");

const processEnvBuildDefine = (mode, env) => {
  const stringify = (value) => JSON.stringify(value ?? "");
  return {
    "process.env.NODE_ENV": JSON.stringify(mode),
    "process.env.PUBLIC_URL": stringify(env.PUBLIC_URL),
    "process.env.ASSETS_URL": stringify(env.ASSETS_URL || env.PUBLIC_URL),
    "process.env.HTML_RENDERER_URL": stringify(env.HTML_RENDERER_URL),
    "process.env.REACT_APP_API_ENDPOINT": stringify(env.REACT_APP_API_ENDPOINT),
    "process.env.REACT_APP_AUTHENTICATION_CLIENT_ID": stringify(
      env.REACT_APP_AUTHENTICATION_CLIENT_ID,
    ),
    "process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS": stringify(
      env.REACT_APP_ALLOWED_IFRAME_ORIGINS,
    ),
    "process.env.REACT_APP_SCRATCH_FRAME_URL": stringify(
      env.REACT_APP_SCRATCH_FRAME_URL,
    ),
    "process.env.REACT_APP_SENTRY_DSN": stringify(env.REACT_APP_SENTRY_DSN),
    "process.env.REACT_APP_SENTRY_ENV": stringify(env.REACT_APP_SENTRY_ENV),
  };
};

const resolveViteBase = (mode, env) => {
  if (mode === "development") return "/";
  const raw = env.PUBLIC_URL || "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
};

const editorVitePlugins = (react, svgr, nodePolyfills) => [
  react({
    babel: {
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
  }),
  svgr({
    include: "**/src/assets/icons/**/*.svg",
    svgrOptions: { exportType: "default" },
  }),
  nodePolyfills({ include: ["stream", "path", "url", "assert"] }),
];

const emitClassicBundleHtml = ({ template, fileName, bundle }) => ({
  name: `emit-classic-bundle-html:${fileName}`,
  apply: "build",
  generateBundle() {
    const html = fs
      .readFileSync(template, "utf8")
      .replace(
        /<script\s+type="module"\s+src="\/src\/[^"]+"><\/script>\s*/,
        `<script src="${bundle}"></script>`,
      );
    this.emitFile({ type: "asset", fileName, source: html });
  },
});

const classicIifeBuildOptions = ({
  root,
  entry,
  name,
  cleansOutput = false,
}) => ({
  outDir: path.resolve(root, "build"),
  emptyOutDir: cleansOutput,
  copyPublicDir: cleansOutput,
  rolldownOptions: {
    input: path.resolve(root, entry),
    output: {
      format: "iife",
      entryFileNames: `${name}.js`,
      assetFileNames: "assets/[name]-[hash][extname]",
    },
  },
});

const copyDirectoryContentsTarget = ({ root, sourceDirectory, dest }) => {
  const absoluteSourceDirectory = path.resolve(root, sourceDirectory);
  const sourceDirectorySegmentCount = path
    .relative(root, absoluteSourceDirectory)
    .split(path.sep).length;
  return {
    src: `${absoluteSourceDirectory.replace(/\\/g, "/")}/**/*`,
    dest,
    rename: { stripBase: sourceDirectorySegmentCount },
  };
};

module.exports = {
  processEnvBuildDefine,
  resolveViteBase,
  editorVitePlugins,
  emitClassicBundleHtml,
  classicIifeBuildOptions,
  copyDirectoryContentsTarget,
};
