// A marked inline extension that supports kramdown-style inline attribute
// lists (IAL) on inline code spans, e.g.
//
//   `Looks`{:class="block3looks"}
//
// Server-rendered instructions go through kramdown (Ruby), which understands
// this syntax natively. Editable instructions are rendered client-side with
// `marked`, which does not, so without this extension the `{:...}` would leak
// into the output as literal text and no attributes would be applied.
//
// Supported attribute forms (space separated, matching kramdown):
//   - .class            -> adds to the class attribute
//   - #id               -> sets the id attribute
//   - key="value"       -> sets an arbitrary attribute (quotes optional)
//
// Only single-backtick spans immediately followed by the `{:...}` block are
// matched; every other code span falls through to marked's default codespan.

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const parseAttributes = (attrString) => {
  const classes = [];
  const attributes = {};
  const rule = /([.#])([-\w]+)|([-\w:]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;

  let match;
  while ((match = rule.exec(attrString)) !== null) {
    if (match[1] === ".") {
      classes.push(match[2]);
    } else if (match[1] === "#") {
      attributes.id = match[2];
    } else if (match[3]) {
      const key = match[3];
      const value = match[4] ?? match[5] ?? match[6] ?? "";
      if (key === "class") {
        classes.push(...value.split(/\s+/).filter(Boolean));
      } else {
        attributes[key] = value;
      }
    }
  }

  if (classes.length > 0) {
    attributes.class = classes.join(" ");
  }

  return attributes;
};

const inlineCodeAttributes = {
  name: "inlineCodeAttributes",
  level: "inline",
  start(src) {
    const index = src.indexOf("`");
    return index < 0 ? undefined : index;
  },
  tokenizer(src) {
    const rule = /^`([^`\n]+)`\{:([^}\n]*)\}/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: "inlineCodeAttributes",
        raw: match[0],
        text: match[1],
        attributes: parseAttributes(match[2]),
      };
    }
  },
  renderer(token) {
    // Emit class and id first for a stable, natural attribute order.
    const order = ["class", "id"];
    const attributeString = Object.entries(token.attributes)
      .sort(
        ([a], [b]) =>
          (order.includes(a) ? order.indexOf(a) : order.length) -
          (order.includes(b) ? order.indexOf(b) : order.length),
      )
      .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
      .join("");
    return `<code${attributeString}>${escapeHtml(token.text)}</code>`;
  },
};

export default inlineCodeAttributes;
