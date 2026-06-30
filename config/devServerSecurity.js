const crossOriginHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers":
    "X-Requested-With, content-type, Authorization",
  // Pyodide input and interruption need cross-origin isolation on the host app.
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

const crossOriginResourcePolicyExactPaths = [
  "/pyodide/shims/_internal_sense_hat.js",
  "/pyodide/shims/pygal.js",
  "/PyodideWorker.js",
];

const crossOriginResourcePolicyPrefixes = [
  "/scratch.html",
  "/html-renderer.html",
];

const shouldSetCrossOriginResourcePolicy = (url = "") =>
  crossOriginResourcePolicyExactPaths.includes(url) ||
  crossOriginResourcePolicyPrefixes.some((prefix) => url.startsWith(prefix));

const setCrossOriginResourcePolicy = (req, res, next) => {
  if (shouldSetCrossOriginResourcePolicy(req.url)) {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
  next();
};

module.exports = {
  crossOriginHeaders,
  setCrossOriginResourcePolicy,
  shouldSetCrossOriginResourcePolicy,
};
