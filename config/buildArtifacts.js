const path = require("path");

const getScratchStaticDir = (rootDir) =>
  path.resolve(
    rootDir,
    "node_modules/@RaspberryPiFoundation/scratch-gui/dist/static",
  );

const getScratchChunkDir = (rootDir) =>
  path.resolve(
    rootDir,
    "node_modules/@RaspberryPiFoundation/scratch-gui/dist/chunks",
  );

const mainCopyPatterns = [
  { from: "public", to: "" },
  { from: "src/projects", to: "projects" },
  {
    from: "node_modules/@raspberrypifoundation/python-friendly-error-messages/copydecks",
    to: "python-error-copydecks",
  },
];

const getScratchCopyPatterns = ({ scratchStaticDir, scratchChunkDir }) => [
  { from: scratchStaticDir, to: "scratch-gui/static" },
  { from: `${scratchStaticDir}/assets`, to: "vendor/static/assets" },
  { from: scratchChunkDir, to: "chunks" },
  {
    from: "node_modules/scratchReactVendor/umd/react.production.min.js",
    to: "vendor/react.production.min.js",
  },
  {
    from: "node_modules/scratchReactDomVendor/umd/react-dom.production.min.js",
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
    from: "node_modules/@RaspberryPiFoundation/scratch-gui/dist/scratch-gui.js",
    to: "vendor/scratch-gui.js",
  },
  {
    from: "node_modules/@RaspberryPiFoundation/scratch-gui/dist/scratch-gui.js.LICENSE.txt",
    to: "vendor/scratch-gui.js.LICENSE.txt",
  },
];

module.exports = {
  getScratchChunkDir,
  getScratchCopyPatterns,
  getScratchStaticDir,
  mainCopyPatterns,
};
