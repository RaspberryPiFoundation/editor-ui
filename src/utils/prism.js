// Prism's languages and plugins used to be injected by babel-plugin-prismjs
// but stopped running during the Vite migration.
// Registering them here keeps the set explicit and independent of the build
// pipeline.
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/plugins/normalize-whitespace/prism-normalize-whitespace";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-highlight/prism-line-highlight";
import "prismjs/plugins/highlight-keywords/prism-highlight-keywords";

Prism.manual = true;

Prism.plugins.NormalizeWhitespace?.setDefaults({
  "remove-indent": false,
  "remove-initial-line-feed": true,
  "left-trim": false,
});

// Remove multiple leading blank lines (empty or whitespace-only), which would
// otherwise render as blank rows and be counted by the line-numbers plugin.
Prism.hooks.add("before-sanity-check", (env) => {
  if (!env.code) return;

  env.code = env.code.replace(/^(?:\s*\n)+/, "");
});

export default Prism;
