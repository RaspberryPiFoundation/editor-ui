const designSystemWarningsKey = "__designSystemWarningsDeduped";
const designSystemIconWarning =
  "DEPRECATED: icons as React elements will not be supported in future releases";

const dedupeDesignSystemWarnings = () => {
  if (process.env.NODE_ENV === "production" || typeof window !== "object") {
    return;
  }

  if (window[designSystemWarningsKey]) {
    return;
  }

  window[designSystemWarningsKey] = true;

  const originalWarn = console.warn.bind(console);
  let hasShownDesignSystemIconWarning = false;

  console.warn = (...args) => {
    if (args[0] === designSystemIconWarning) {
      if (hasShownDesignSystemIconWarning) {
        return;
      }

      hasShownDesignSystemIconWarning = true;
    }

    originalWarn(...args);
  };
};

export default dedupeDesignSystemWarnings;
