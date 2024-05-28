// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import PyodideWorker from "../components/Editor/Runners/PyodideRunner/PyodideWorker.mock.js";

import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

/* global globalThis */
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // Deprecated
  removeListener: jest.fn(), // Deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

window.plausible = jest.fn();

jest.mock("react-i18next", () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str) => (str.includes("null") ? null : str),
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        language: "ja-JP",
        options: {
          locales: ["en", "es-LA", "fr-FR", "ja-JP"],
        },
      },
    };
  },
  Trans: ({ children, i18nKey }) => children || i18nKey,
}));

loadDevMessages();
loadErrorMessages();

jest.mock("../../src/utils/i18n.js", () => ({
  t: (string) => string,
}));

global.Blob = jest.fn();
window.URL.createObjectURL = jest.fn();
window.Worker = PyodideWorker;
