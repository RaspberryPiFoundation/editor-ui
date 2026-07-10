const fs = require("fs");
const path = require("path");

const browserProcessEnvValues = (mode, env) => ({
  NODE_ENV: mode,
  PUBLIC_URL: env.PUBLIC_URL ?? "",
  ASSETS_URL: env.ASSETS_URL || env.PUBLIC_URL || "",
  HTML_RENDERER_URL: env.HTML_RENDERER_URL ?? "",
  REACT_APP_API_ENDPOINT: env.REACT_APP_API_ENDPOINT ?? "",
  REACT_APP_AUTHENTICATION_CLIENT_ID:
    env.REACT_APP_AUTHENTICATION_CLIENT_ID ?? "",
  REACT_APP_ALLOWED_IFRAME_ORIGINS: env.REACT_APP_ALLOWED_IFRAME_ORIGINS ?? "",
  REACT_APP_SCRATCH_FRAME_URL: env.REACT_APP_SCRATCH_FRAME_URL ?? "",
  REACT_APP_SENTRY_DSN: env.REACT_APP_SENTRY_DSN ?? "",
  REACT_APP_SENTRY_ENV: env.REACT_APP_SENTRY_ENV ?? "",
});

const processEnvBuildDefine = (mode, env) => {
  const values = browserProcessEnvValues(mode, env);
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      `process.env.${key}`,
      JSON.stringify(value),
    ]),
  );
};

// Vite dev serving does not transform these process.env references.
const injectProcessEnvIntoDevHtml = (mode, env) => ({
  name: "inject-process-env-into-dev-html",
  apply: "serve",
  transformIndexHtml: {
    order: "pre",
    handler() {
      return [
        {
          tag: "script",
          injectTo: "head-prepend",
          children: `window.process = { env: ${JSON.stringify(browserProcessEnvValues(mode, env))} };`,
        },
      ];
    },
  },
});

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
  nodePolyfills({
    include: ["stream", "path", "url", "assert"],
    globals: { process: false, Buffer: true, global: true },
  }),
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
  injectProcessEnvIntoDevHtml,
  resolveViteBase,
  editorVitePlugins,
  emitClassicBundleHtml,
  classicIifeBuildOptions,
  copyDirectoryContentsTarget,
};
