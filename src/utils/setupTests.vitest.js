// Vitest equivalent of setupTests.js, used by every file not listed in
// JEST_ONLY_TEST_FILES (test-runner-migration.js).
import "@testing-library/jest-dom";
import { vi } from "vitest";

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // Deprecated
  removeListener: vi.fn(), // Deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

vi.mock("@raspberrypifoundation/python-friendly-error-messages", () => ({
  loadCopydeckFor: vi.fn(),
  registerAdapter: vi.fn(),
  cpythonAdapter: {},
  friendlyExplain: vi.fn(),
}));

// react-i18next's real useTranslation returns an uninitialised i18n
// instance under Vitest (no app entrypoint runs first to call i18n.init()),
// so anything reading i18n.options - e.g. SaveStatus - crashes. Mocked
// globally to match setupTests.js's Jest equivalent.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str) => (str.includes("null") ? null : str),
    i18n: {
      changeLanguage: () => new Promise(() => {}),
      language: "ja-JP",
      options: {
        locales: ["en", "es-LA", "fr-FR", "ja-JP"],
      },
    },
  }),
  Trans: ({ children, i18nKey }) => children || i18nKey,
}));
