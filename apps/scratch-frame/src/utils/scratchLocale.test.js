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
    ["no-NO", "nb"],
    ["pt-BR", "pt-br"],
    ["zh-CN", "zh-cn"],
    ["zh-TW", "zh-tw"],
  ])("maps the regional locale %s to %s", (locale, expected) => {
    expect(toScratchLocale(locale)).toBe(expected);
  });

  test("drops the region when no override is required", () => {
    expect(toScratchLocale("de-DE")).toBe("de");
  });

  test.each([
    [" es-la ", "es-419"],
    ["es-419", "es-419"],
    ["pt-br", "pt-br"],
    ["zh-cn", "zh-cn"],
  ])("normalizes %s to %s", (locale, expected) => {
    expect(toScratchLocale(locale)).toBe(expected);
  });

  test("falls back to English when no locale is supplied", () => {
    expect(toScratchLocale()).toBe("en");
    expect(toScratchLocale("")).toBe("en");
    expect(toScratchLocale("   ")).toBe("en");
  });
});
