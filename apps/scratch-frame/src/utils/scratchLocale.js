const scratchLocaleOverrides = {
  "es-LA": "es-419",
  "no-NO": "nb",
  "pt-BR": "pt-br",
  "zh-CN": "zh-cn",
  "zh-TW": "zh-tw",
};

export const toScratchLocale = (locale) => {
  if (!locale) return "en";

  return scratchLocaleOverrides[locale] || locale.split("-")[0].toLowerCase();
};
