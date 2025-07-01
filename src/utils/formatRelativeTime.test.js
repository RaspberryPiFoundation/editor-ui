import { formatRelativeTime } from "./formatRelativeTime";

describe("formatRelativeTime", () => {
  describe("formats the times for now in different locales", () => {
    const now = Date.now();

    test("formats relative time in en", () => {
      const result = formatRelativeTime(now, now, "en");
      expect(result).toEqual("now");
    });

    test("formats relative time in en-US", () => {
      const result = formatRelativeTime(now, now, "en-US");
      expect(result).toEqual("now");
    });

    test("formats relative time in fr-FR", () => {
      const result = formatRelativeTime(now, now, "fr-FR");
      expect(result).toEqual("maintenant");
    });

    test("formats relative time in es-LA", () => {
      const result = formatRelativeTime(now, now, "es-LA");
      expect(result).toEqual("ahora");
    });
  });
  describe("formats the times for one minute ago in different locales", () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 1 minute ago

    test("formats relative time in en", () => {
      const result = formatRelativeTime(oneMinuteAgo, Date.now(), "en");
      expect(result).toEqual("1 min ago");
    });

    test("formats relative time in en-US", () => {
      const result = formatRelativeTime(oneMinuteAgo, Date.now(), "en-US");
      expect(result).toEqual("1 min. ago");
    });

    test("formats relative time in fr-FR", () => {
      const result = formatRelativeTime(oneMinuteAgo, Date.now(), "fr-FR");
      expect(result).toEqual("il y a 1\u00A0min");
    });

    test("formats relative time in es-LA", () => {
      const result = formatRelativeTime(oneMinuteAgo, Date.now(), "es-LA");
      expect(result).toEqual("hace 1 min");
    });
  });

  describe("formats the times for one hour ago in different locales", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

    test("formats relative time in en", () => {
      const result = formatRelativeTime(oneHourAgo, Date.now(), "en");
      expect(result).toEqual("1 hr ago");
    });

    test("formats relative time in en-US", () => {
      const result = formatRelativeTime(oneHourAgo, Date.now(), "en-US");
      expect(result).toEqual("1 hr. ago");
    });

    test("formats relative time in fr-FR", () => {
      const result = formatRelativeTime(oneHourAgo, Date.now(), "fr-FR");
      expect(result).toEqual("il y a 1\u00A0h");
    });

    test("formats relative time in es-LA", () => {
      const result = formatRelativeTime(oneHourAgo, Date.now(), "es-LA");
      expect(result).toEqual("hace 1 h");
    });
  });
});
