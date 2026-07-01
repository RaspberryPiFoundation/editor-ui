export const buildProjectCodeSnapshot = (components = []) => {
  if (!Array.isArray(components)) {
    return "";
  }

  return components
    .map(
      ({ name, extension, content }) =>
        `${name}.${extension}\0${content ?? ""}`,
    )
    .sort()
    .join("\n");
};
