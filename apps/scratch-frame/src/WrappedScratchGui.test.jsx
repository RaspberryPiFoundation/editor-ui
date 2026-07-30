import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";

vi.mock("./ScratchIntegrationHOC.jsx", () => ({
  default: (Component) => Component,
}));

describe("WrappedScratchGui", () => {
  const localesInitialState = {
    locale: "en",
    messages: {},
    messagesByLocale: { en: {}, "es-419": {} },
  };

  beforeEach(() => {
    vi.resetModules();
    const ScratchGui = () => {
      const locale = useSelector((state) => state.locales.locale);
      return React.createElement("div", null, locale);
    };
    window.GUI = {
      default: ScratchGui,
      setAppElement: vi.fn(),
      initLocale: vi.fn((state, locale) =>
        Object.prototype.hasOwnProperty.call(state.messagesByLocale, locale)
          ? { ...state, locale, messages: state.messagesByLocale[locale] }
          : state,
      ),
      localesInitialState,
      guiReducers: {
        locales: (state = localesInitialState) => state,
        scratchGui: (state = {}) => state,
      },
      buildInitialState: vi.fn(() => ({ projectState: {} })),
      legacyConfig: {},
      guiMiddleware: undefined,
    };
  });

  afterEach(() => {
    delete window.GUI;
  });

  it("initializes Scratch with a supported locale before rendering", async () => {
    const { createScratchStore } = await import("./WrappedScratchGui.jsx");

    const store = createScratchStore("es-419");

    expect(store.getState().locales.locale).toBe("es-419");
  });

  it("keeps Scratch in English when the locale is unsupported", async () => {
    const { createScratchStore } = await import("./WrappedScratchGui.jsx");

    const store = createScratchStore("vls");

    expect(store.getState().locales.locale).toBe("en");
  });

  it("renders Scratch with the initialized store", async () => {
    const { default: WrappedScratchGui } =
      await import("./WrappedScratchGui.jsx");

    render(React.createElement(WrappedScratchGui, { locale: "es-419" }));

    expect(screen.getByText("es-419")).toBeTruthy();
    expect(window.GUI.initLocale).toHaveBeenCalledWith(
      localesInitialState,
      "es-419",
    );
  });
});
