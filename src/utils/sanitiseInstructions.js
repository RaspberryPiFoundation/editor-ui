import DOMPurify from "dompurify";

// Some project steps embed the editor's own project viewer to show a worked
// example. Frames from anywhere else are removed
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
  // `use` draws the icons inside a scratchblocks SVG, such as the green flag
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

purifier.addHook("uponSanitizeElement", (node, { tagName }) => {
  if (tagName === "iframe" && !isProjectViewer(node.getAttribute("src"))) {
    return remove(node);
  }

  // A stylesheet anywhere else would restyle the rest of the editor
  if (tagName === "style" && !node.closest("svg")) {
    return remove(node);
  }

  // Same document references only, so a `use` cannot pull in outside markup
  if (tagName === "use" && !node.getAttribute("href")?.startsWith("#")) {
    return remove(node);
  }
});

const sanitiseInstructions = (html) => purifier.sanitize(html, sanitiseConfig);

export default sanitiseInstructions;
