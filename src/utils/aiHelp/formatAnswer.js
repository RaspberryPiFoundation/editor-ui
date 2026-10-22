// Minimal formatter for model answers.
//
// The models write markdown whether or not they are asked to: fenced ```python
// blocks and inline `backticks` throughout. Rendering the raw string left the
// fences visible and the code hard to read, which matters most on the rung whose
// whole job is to show a fix.
//
// This deliberately is NOT a markdown parser. It handles fenced code blocks and
// inline code and nothing else - no links, no emphasis, no HTML. Everything is
// returned as data for the component to render as React elements, so untrusted
// model output never becomes markup. `rpf-markdown-core` would be the tool for
// real markdown, but it cannot cope with the half-written syntax that a
// streaming answer produces.

const FENCE = /^```([A-Za-z0-9_+-]*)\s*$/;

// Inline code, non-greedy, single backticks only. An unclosed backtick is left
// as literal text rather than swallowing the rest of the answer.
const splitInlineCode = (text) => {
  const spans = [];
  const pattern = /`([^`\n]+)`/g;
  let cursor = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      spans.push({ code: false, text: text.slice(cursor, match.index) });
    }
    spans.push({ code: true, text: match[1] });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    spans.push({ code: false, text: text.slice(cursor) });
  }

  return spans;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The friendly error message highlights the variable, file and line it is
// talking about with `pfem__var`, `pfem__file` and `pfem__line`. The model is
// not trusted to write that markup, so the same words are found in its answer
// here instead, using the values the copydeck highlighted. Any "line N" is
// tagged, not just the error's line - the model often points elsewhere.
const highlightPattern = ({ name, file } = {}) => {
  // Python names are case-sensitive, so only "line" ignores case.
  const alternatives = ["(?<line>\\b[Ll]ine \\d+\\b)"];
  if (name) {
    alternatives.push(`(?<var>(?<![\\w.])${escapeRegExp(name)}(?!\\w))`);
  }
  if (file) {
    alternatives.push(`(?<file>(?<![\\w.])${escapeRegExp(file)}(?!\\w))`);
  }
  return new RegExp(alternatives.join("|"), "g");
};

const highlightText = (text, terms) => {
  const spans = [];
  const pattern = highlightPattern(terms);
  let cursor = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      spans.push({ code: false, text: text.slice(cursor, match.index) });
    }
    const { groups } = match;
    const highlight = Object.keys(groups).find((key) => groups[key]);
    spans.push({ code: false, text: match[0], highlight });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    spans.push({ code: false, text: text.slice(cursor) });
  }

  return spans;
};

// Code the model put in backticks takes the variable or file colour when it is
// exactly that name, and the general code colour otherwise.
const highlightCode = (text, { name, file } = {}) => {
  if (name && text === name) {
    return "var";
  }
  if (file && text === file) {
    return "file";
  }
  return "code";
};

const highlightSpans = (spans, terms) =>
  spans.flatMap((span) =>
    span.code
      ? [{ ...span, highlight: highlightCode(span.text, terms) }]
      : highlightText(span.text, terms),
  );

/**
 * Split an answer into text and code blocks.
 *
 * Returns [{ type: "text", spans }, { type: "code", language, content, open }].
 *
 * Pass `terms` ({ name, file }) to tag text spans with a `highlight` of "var",
 * "file", "line" or "code", matching the friendly error message's classes.
 * Without it, spans are left untagged.
 * `open` marks a fence that has not been closed yet, which is the normal state
 * part-way through a streamed answer - it is rendered the same way, so the code
 * does not reflow when the closing fence arrives.
 */
export const parseAnswer = (text = "", terms = null) => {
  const blocks = [];
  let textLines = [];
  let codeLines = null;
  let language = "";

  // A blank line starts a new paragraph. Within a paragraph the model's own
  // hard wraps are collapsed to spaces: they were chosen for an 80-column
  // terminal, not for this panel, and honouring them made the answer read like
  // preformatted output.
  const flushText = () => {
    const paragraphs = textLines
      .join("\n")
      .split(/\n\s*\n/)
      .map((paragraph) =>
        paragraph.split("\n").join(" ").replace(/\s+/g, " ").trim(),
      )
      .filter(Boolean);

    for (const paragraph of paragraphs) {
      const spans = splitInlineCode(paragraph);
      blocks.push({
        type: "text",
        spans: terms ? highlightSpans(spans, terms) : spans,
      });
    }
    textLines = [];
  };

  for (const line of text.split("\n")) {
    const fence = line.match(FENCE);

    if (codeLines === null && fence) {
      flushText();
      codeLines = [];
      language = fence[1];
      continue;
    }

    if (codeLines !== null) {
      // Any closing fence ends the block, even one carrying a language tag.
      if (line.trim().startsWith("```")) {
        blocks.push({
          type: "code",
          language,
          content: codeLines.join("\n"),
          open: false,
        });
        codeLines = null;
        language = "";
      } else {
        codeLines.push(line);
      }
      continue;
    }

    textLines.push(line);
  }

  if (codeLines !== null) {
    blocks.push({
      type: "code",
      language,
      content: codeLines.join("\n"),
      open: true,
    });
  } else {
    flushText();
  }

  return blocks;
};

/**
 * Remove code the model was told not to give away.
 *
 * The hint and explain rungs are meant to point at the problem and leave the
 * change to the learner - that is the only thing that makes "Show me the fix"
 * worth clicking. Small models write the corrected line anyway, however bluntly
 * they are told not to, so this is enforced rather than requested.
 *
 * Cutting at the first fence keeps the diagnosis, which the models put first,
 * and drops the answer.
 *
 * The dangling lead-in is trimmed whether or not a fence followed it. A model
 * that obeys the instruction not to write code still tends to announce it
 * first, ending the reply on "Here's what you need to change:" with nothing
 * after it.
 */
export const withheldFix = (text = "") => {
  const fence = text.indexOf("```");
  const withheld = fence >= 0;
  const lines = (withheld ? text.slice(0, fence) : text)
    .split("\n")
    .map((line) => line.trimEnd());

  while (lines.length > 0) {
    const last = lines[lines.length - 1].trim();
    if (last === "" || last.endsWith(":")) {
      lines.pop();
    } else {
      break;
    }
  }

  return { text: lines.join("\n").trim(), withheld };
};
