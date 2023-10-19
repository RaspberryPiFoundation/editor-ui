const camelCase = (string) =>
  string
    .toLowerCase()
    .replace(/([-_][a-z0-9])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", ""),
    );

export default camelCase;
