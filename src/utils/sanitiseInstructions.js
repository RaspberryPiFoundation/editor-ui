import DOMPurify from "dompurify";

// Some project steps embed the editor's own project viewer. Nothing else may be
// framed
const EMBED_ORIGINS = [
  "https://editor.raspberrypi.org",
  "https://staging-editor.raspberrypi.org",
];

const isProjectViewer = (src) => {
  try {
    return EMBED_ORIGINS.includes(new URL(src).origin);
  } catch {
    return false;
  }
};

const sanitiseConfig = {
  // `use` draws the icons in a scratchblocks SVG, such as the green flag
  ADD_TAGS: ["iframe", "use"],
  ADD_ATTR: [
    "allowfullscreen",
    "frameborder",
    "marginheight",
    "marginwidth",
    "target",
  ],
};

const purifier = DOMPurify(window);

const remove = (node) => node.parentNode?.removeChild(node);

const isLocalRef = (value) => value == null || value.startsWith("#");

purifier.addHook("uponSanitizeElement", (node, { tagName }) => {
  if (tagName === "iframe" && !isProjectViewer(node.getAttribute("src"))) {
    return remove(node);
  }

  // Only scratchblocks needs a stylesheet, and it puts one inside each SVG it
  // renders. `url(#...)` is its own SVG filters; anything loaded from outside
  // would report who is reading the instructions
  if (tagName === "style") {
    const css = node.textContent ?? "";
    const loadsOutsideCss =
      /@import/i.test(css) || /url\(\s*['"]?(?!#)/i.test(css);

    if (!node.closest("svg") || loadsOutsideCss) {
      return remove(node);
    }
  }

  if (
    tagName === "use" &&
    !(
      isLocalRef(node.getAttribute("href")) &&
      isLocalRef(node.getAttribute("xlink:href"))
    )
  ) {
    return remove(node);
  }
});

const sanitiseInstructions = (html) => purifier.sanitize(html, sanitiseConfig);

export default sanitiseInstructions;
