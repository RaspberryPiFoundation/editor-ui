import { intlFormatDistance } from "date-fns";

const localeMap = {
  "en-US": "en-US",
  en: "en-GB",
  "fr-FR": "fr",
  "es-LA": "es",
};

export const formatRelativeTime = (lastSavedTime, now, languageCode) => {
  const locale = localeMap[languageCode];
  return intlFormatDistance(lastSavedTime, now, {
    style: "narrow",
    locale,
  });
};
