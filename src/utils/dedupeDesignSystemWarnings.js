const designSystemWarningsKey = "__designSystemWarningsDeduped";
const designSystemIconWarning =
  "DEPRECATED: icons as React elements will not be supported in future releases";

const dedupeDesignSystemWarnings = () => {
  if (
    process.env.NODE_ENV !== "development" ||
    typeof window !== "object" ||
    window[designSystemWarningsKey]
  ) {
    return;
  }

  window[designSystemWarningsKey] = true;

  const originalWarn = console.warn.bind(console);
  let didWarnIcon = false;

  console.warn = (...args) => {
    if (args[0] === designSystemIconWarning) {
      if (didWarnIcon) {
        return;
      }

      didWarnIcon = true;
    }

    originalWarn(...args);
  };
};

export default dedupeDesignSystemWarnings;
