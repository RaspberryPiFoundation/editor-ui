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
