const scratchWarningsKey = "__scratchWarningsDeduped";

const scratchWarningMatchers = {
  error: [
    [
      "Support for defaultProps will be removed",
      "React 18 compatibility warnings about function-component defaultProps",
    ],
    [
      "React does not recognize the `%s` prop on a DOM element",
      "React warnings about scratch-editor props leaking onto DOM nodes",
    ],
    [
      "Unknown event handler property `%s`",
      "React warnings about unsupported event handler props",
    ],
    [
      "findDOMNode is deprecated",
      "React warnings about deprecated findDOMNode usage",
    ],
  ],
  warn: [
    [
      "componentWillMount has been renamed",
      "React warnings about legacy componentWillMount usage",
    ],
    [
      "componentWillReceiveProps has been renamed",
      "React warnings about legacy componentWillReceiveProps usage",
    ],
  ],
};

const dedupeScratchWarnings = () => {
  if (
    process.env.NODE_ENV === "production" ||
    typeof window !== "object" ||
    window[scratchWarningsKey]
  ) {
    return;
  }

  window[scratchWarningsKey] = true;

  const seenSummaries = new Set();
  const originalWarn = console.warn.bind(console);

  const wrapConsoleMethod = (method) => {
    const originalMethod = console[method].bind(console);

    return (...args) => {
      const message = typeof args[0] === "string" ? args[0] : "";
      const summary = scratchWarningMatchers[method]?.find(([needle]) =>
        message.includes(needle),
      );

      if (!summary) {
        originalMethod(...args);
        return;
      }

      const [, text] = summary;

      if (seenSummaries.has(text)) {
        return;
      }

      seenSummaries.add(text);
      originalWarn(
        `[scratch-editor] emitted ${text}. Further duplicates suppressed.`,
      );
    };
  };

  console.error = wrapConsoleMethod("error");
  console.warn = wrapConsoleMethod("warn");
};

export default dedupeScratchWarnings;
