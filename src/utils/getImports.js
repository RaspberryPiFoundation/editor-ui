export const getImports = (code, t) => {
  const codeWithoutMultilineStrings = code.replace(
    /'''[\s\S]*?'''|"""[\s\S]*?"""/gm,
    "",
  );
  const importRegex =
    /(?<=^\s*)(from\s+([a-zA-Z0-9_.]+)(\s+import\s+([a-zA-Z0-9_.]+))?)|(?<=^\s*)(import\s+([a-zA-Z0-9_.]+))/gm;
  const matches = codeWithoutMultilineStrings.match(importRegex);
  const imports = matches
    ? matches.map(
        (match) =>
          match
            .split(/from|import/)
            .filter(Boolean)
            .map((s) => s.trim())[0],
      )
    : [];
  if (code.includes(`# ${t("input.comment.py5")}`)) {
    imports.push("py5_imported");
  }
  return imports;
};
