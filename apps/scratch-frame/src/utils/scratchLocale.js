const scratchLocaleMap = {
  "es-la": "es-419",
  "es-419": "es-419",
  "no-no": "nb",
  "pt-br": "pt-br",
  "zh-cn": "zh-cn",
  "zh-tw": "zh-tw",
};

export const toScratchLocale = (locale) => {
  const normalizedLocale = locale?.trim().toLowerCase();
  if (!normalizedLocale) return "en";

  return scratchLocaleMap[normalizedLocale] || normalizedLocale.split("-")[0];
};
