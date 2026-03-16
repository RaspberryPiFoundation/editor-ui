const scratchConsoleBrokerKey = "__scratchConsoleBrokerInstalled";

const scratchWarningMatchers = [
  {
    method: "error",
    needle: "Support for defaultProps will be removed",
    id: "react-default-props",
    summary:
      "React 18 compatibility warnings about function-component defaultProps",
  },
  {
    method: "error",
    needle: "React does not recognize the `%s` prop on a DOM element",
    id: "react-dom-props",
    summary: "React warnings about scratch-editor props leaking onto DOM nodes",
  },
  {
    method: "error",
    needle: "Unknown event handler property `%s`",
    id: "react-event-props",
    summary: "React warnings about unsupported event handler props",
  },
  {
    method: "warn",
    needle: "componentWillMount has been renamed",
    id: "react-component-will-mount",
    summary: "React warnings about legacy componentWillMount usage",
  },
  {
    method: "warn",
    needle: "componentWillReceiveProps has been renamed",
    id: "react-component-will-receive-props",
    summary: "React warnings about legacy componentWillReceiveProps usage",
  },
  {
    method: "error",
    needle: "findDOMNode is deprecated",
    id: "react-find-dom-node",
    summary: "React warnings about deprecated findDOMNode usage",
  },
];

const getScratchConsoleCategory = (method, args) => {
  const message = typeof args[0] === "string" ? args[0] : "";
  const matcher = scratchWarningMatchers.find(
    (candidate) =>
      candidate.method === method && message.includes(candidate.needle),
  );

  return matcher || null;
};

const dedupeScratchWarnings = () => {
  if (process.env.NODE_ENV === "production" || typeof window !== "object") {
    return;
  }

  if (window[scratchConsoleBrokerKey]) {
    return;
  }

  window[scratchConsoleBrokerKey] = true;

  const seenCategories = new Set();
  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);

  const emitCategorySummary = (category) => {
    if (seenCategories.has(category.id)) {
      return;
    }

    seenCategories.add(category.id);
    originalWarn(
      `[scratch-editor] emitted ${category.summary}. Further duplicates suppressed.`,
    );
  };

  const wrapConsoleMethod = (method, originalMethod) => {
    return (...args) => {
      const category = getScratchConsoleCategory(method, args);

      if (category) {
        emitCategorySummary(category);
        return;
      }

      originalMethod(...args);
    };
  };

  console.error = wrapConsoleMethod("error", originalError);
  console.warn = wrapConsoleMethod("warn", originalWarn);
};

export default dedupeScratchWarnings;
