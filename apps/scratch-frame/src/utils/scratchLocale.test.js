import { toScratchLocale } from "./scratchLocale.js";

describe("toScratchLocale", () => {
  test.each([
    ["ga-IE", "ga"],
    ["es-LA", "es-419"],
    ["fr-FR", "fr"],
  ])("maps the Raspberry Pi locale %s to %s", (locale, expected) => {
    expect(toScratchLocale(locale)).toBe(expected);
  });

  test.each([
    ["pt-BR", "pt-br"],
    ["zh-CN", "zh-cn"],
    ["zh-TW", "zh-tw"],
  ])("maps the regional locale %s to %s", (locale, expected) => {
    expect(toScratchLocale(locale)).toBe(expected);
  });

  test("uses the supported base language for other regional locales", () => {
    expect(toScratchLocale("de-DE")).toBe("de");
  });

  test.each([undefined, "", "xx-XX", "me-ME"])(
    "falls back to English for unsupported locale %s",
    (locale) => {
      expect(toScratchLocale(locale)).toBe("en");
    },
  );
});
