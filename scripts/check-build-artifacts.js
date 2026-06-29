const fs = require("fs");
const path = require("path");

const buildDir = path.resolve(__dirname, "..", "build");

const requiredFiles = [
  "web-component.html",
  "web-component.js",
  "html-renderer.html",
  "html-renderer.js",
  "scratch.html",
  "scratch.js",
  "PyodideWorker.js",
  "translations/en.json",
  "translations/xx-XX.json",
  "projects/blank-html-starter.json",
  "projects/cool-python.json",
  "pyodide/shims/_internal_sense_hat.js",
  "pyodide/shims/pygal.js",
  "shims/processing/p5/p5-shim.js",
  "shims/sense_hat/sense_hat_blob.py",
  "python-error-copydecks/en/copydeck.json",
  "scratch-gui/static/assets",
  "scratch-gui/chunks",
  "chunks",
  "vendor/react.production.min.js",
  "vendor/react-dom.production.min.js",
  "vendor/redux.min.js",
  "vendor/react-redux.min.js",
  "vendor/scratch-gui.js",
];

const missing = requiredFiles.filter(
  (relativePath) => !fs.existsSync(path.join(buildDir, relativePath)),
);

if (missing.length > 0) {
  console.error("Missing required build artifacts:");
  missing.forEach((relativePath) => console.error(`- ${relativePath}`));
  process.exit(1);
}

console.log(
  `Found ${requiredFiles.length} required build artifacts in ${buildDir}.`,
);
