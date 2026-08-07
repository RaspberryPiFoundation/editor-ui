// Editable instructions are stored as a single markdown document; a step
// boundary is signified by a `<br class="page-break" />` marker (the final
// step needs no trailing marker). The instructions panel inserts and removes
// these markers on the author's behalf, so authors edit one step at a time and
// never need to know the syntax.
export const PAGE_BREAK_MARKER = '<br class="page-break" />';

const PAGE_BREAK_REGEX = /<br\s+class=["']page-break["']\s*\/?>/gi;

// A marker is written surrounded by blank lines to keep the stored document
// readable, so the separator swallows up to that much whitespace either side.
// Bounding it keeps the split stable: whatever an author types into a step is
// exactly what is read back out of it.
const STEP_SEPARATOR_REGEX =
  /\n{0,2}<br\s+class=["']page-break["']\s*\/?>\n{0,2}/gi;

const STEP_SEPARATOR = `\n\n${PAGE_BREAK_MARKER}\n\n`;

// Splits the document into its steps, keeping the separator that followed each
// one so the untouched parts can be reassembled byte for byte.
const parseInstructions = (instructions) => {
  const sections = [];
  const separators = [];
  let sectionStart = 0;

  for (const match of instructions.matchAll(STEP_SEPARATOR_REGEX)) {
    sections.push(instructions.slice(sectionStart, match.index));
    separators.push(match[0]);
    sectionStart = match.index + match[0].length;
  }
  sections.push(instructions.slice(sectionStart));

  return { sections, separators };
};

// Always yields at least one section for a string, so an author who has added
// a step but not yet typed into it still gets a (blank) step to edit.
export const splitInstructionsIntoSteps = (instructions) =>
  typeof instructions === "string"
    ? parseInstructions(instructions).sections
    : [];

// Markers typed by hand would silently add steps the pagination did not create,
// so they are dropped as content is written back into the document.
export const withoutPageBreaks = (markdown) =>
  typeof markdown === "string" ? markdown.replace(PAGE_BREAK_REGEX, "") : "";

export const replaceStepMarkdown = (instructions, stepIndex, markdown) => {
  const source = typeof instructions === "string" ? instructions : "";
  const { sections, separators } = parseInstructions(source);

  if (stepIndex < 0 || stepIndex >= sections.length) {
    return source;
  }

  sections[stepIndex] = withoutPageBreaks(markdown);

  return sections.reduce(
    (document, section, index) =>
      index === 0 ? section : `${document}${separators[index - 1]}${section}`,
    "",
  );
};

export const appendStepToInstructions = (instructions) =>
  `${typeof instructions === "string" ? instructions : ""}${STEP_SEPARATOR}`;
