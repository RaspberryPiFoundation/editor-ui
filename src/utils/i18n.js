import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .use(HttpBackend)
  .init({
    debug: true,
    fallbackLng: "en",
    locales: [
      "en",
      "ar-SA",
      "ca-ES",
      "cs-CZ",
      "me-ME",
      "cy-GB",
      "da-DK",
      "de-DE",
      "el-GR",
      "et-EE",
      "es-ES",
      "es-LA",
      "fr-FR",
      "he-IL",
      "hi-IN",
      "hr-HR",
      "it-IT",
      "ja-JP",
      "kn-IN",
      "ko-KR",
      "mr-IN",
      "hu-HU",
      "nl-NL",
      "no-NO",
      "pl-PL",
      "pt-BR",
      "pt-PT",
      "ro-RO",
      "ru-RU",
      "sk-SK",
      "sl-SI",
      "fi-FI",
      "sv-SE",
      "vls-BE",
      "sr-SP",
      "tr-TR",
      "uk-UA",
      "zh-CN",
      "zh-TW",
      "xx-XX",
    ],
    // currently supportedLngs is the same as locales but clever lang loading
    // could reduce the number of supported translation files e.g. 'fr' over 'fr-FR' + variants
    supportedLngs: [
      "en",
      "ar-SA",
      "ca-ES",
      "cs-CZ",
      "me-ME",
      "cy-GB",
      "da-DK",
      "de-DE",
      "el-GR",
      "et-EE",
      "es-ES",
      "es-LA",
      "fr-FR",
      "he-IL",
      "hi-IN",
      "hr-HR",
      "it-IT",
      "ja-JP",
      "kn-IN",
      "ko-KR",
      "mr-IN",
      "hu-HU",
      "nl-NL",
      "no-NO",
      "pl-PL",
      "pt-BR",
      "pt-PT",
      "ro-RO",
      "ru-RU",
      "sk-SK",
      "sl-SI",
      "fi-FI",
      "sv-SE",
      "vls-BE",
      "sr-SP",
      "tr-TR",
      "uk-UA",
      "zh-CN",
      "zh-TW",
      "xx-XX",
    ],
    load: "currentOnly", // otherwise for fr-FR it's load ['fr-FR', 'fr']

    // nonExplicitSupportedLngs: true, // allows locale variants on supportedLngs
    detection: {
      order: ["path"], // only use path to detect local for now
    },

    interpolation: {
      escapeValue: false, // not needed for react!!
    },
    backend: {
      loadPath: `${process.env.PUBLIC_URL}/translations/{{lng}}.json`,
    },
  });

export default i18n;
