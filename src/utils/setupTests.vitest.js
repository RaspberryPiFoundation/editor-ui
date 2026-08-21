// Vitest equivalent of setupTests.js, used by every file not listed in
// JEST_ONLY_TEST_FILES (test-runner-migration.js).
import "@testing-library/jest-dom";
import { vi } from "vitest";

class MemoryStorage {
  #store = new Map();

  getItem(key) {
    return this.#store.has(key) ? this.#store.get(key) : null;
  }

  setItem(key, value) {
    this.#store.set(key, String(value));
  }

  removeItem(key) {
    this.#store.delete(key);
  }

  clear() {
    this.#store.clear();
  }

  get length() {
    return this.#store.size;
  }

  key(index) {
    return Array.from(this.#store.keys())[index] ?? null;
  }
}

Object.defineProperty(window, "localStorage", {
  value: new MemoryStorage(),
  configurable: true,
});

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
  initReactI18next: {},
}));

vi.mock("./i18n", () => ({
  default: { t: (string) => string },
}));
