import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Cookies, CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import AiHintToggle from "./AiHintToggle";
import rootReducer from "../../../../../redux/RootSlice";
import { editorInitialState } from "../../../../../redux/EditorSlice";
import { userSettingsInitialState } from "../../../../../redux/UserSettingsSlice";
import ApiCallHandler from "../../../../../utils/apiCallHandler";

vi.mock("../../../../../utils/apiCallHandler");

vi.mock("react-i18next", async () => {
  const { cloneElement, createElement } = await vi.importActual("react");
  return {
    useTranslation: () => ({ t: (str) => str }),
    Trans: ({ i18nKey, components = {} }) => [
      createElement("span", { key: i18nKey }, i18nKey),
      ...Object.entries(components).map(([name, element]) =>
        cloneElement(element, { key: name }, name),
      ),
    ],
  };
});

const updateUserSettings = vi.fn().mockResolvedValue({ data: {} });

const renderToggle = ({
  aiHintsEnabled = true,
  focusRequested = false,
} = {}) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      editor: {
        ...editorInitialState,
        aiHintToggleFocusRequested: focusRequested,
        project: { identifier: "coach-gong-glide" },
      },
      instructions: {},
      auth: { user: { access_token: "token" } },
      userSettings: { ...userSettingsInitialState, aiHintsEnabled },
    },
  });
  render(
    <Provider store={store}>
      <CookiesProvider cookies={new Cookies()}>
        <AiHintToggle />
      </CookiesProvider>
    </Provider>,
  );
  return { store, toggle: screen.getByRole("switch") };
};

const aiHintToggledHandler = vi.fn();
const onAiHintToggled = (e) => aiHintToggledHandler(e.detail);

describe("AiHintToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ApiCallHandler.mockImplementation(() => ({ updateUserSettings }));
    document.addEventListener("editor-aiHintToggled", onAiHintToggled);
  });

  afterEach(() => {
    document.removeEventListener("editor-aiHintToggled", onAiHintToggled);
  });

  test("is on by default", () => {
    const { toggle } = renderToggle();
    expect(toggle).toBeChecked();
  });

  test("is off when the setting is off", () => {
    const { toggle } = renderToggle({ aiHintsEnabled: false });
    expect(toggle).not.toBeChecked();
  });

  test("saves the setting when turned off", () => {
    const { store, toggle } = renderToggle();
    fireEvent.click(toggle);
    expect(store.getState().userSettings.aiHintsEnabled).toBe(false);
    expect(updateUserSettings).toHaveBeenCalledWith(
      { ai_hints_enabled: false },
      "token",
    );
    expect(toggle).not.toBeChecked();
  });

  test("saves the setting when turned back on", () => {
    const { store, toggle } = renderToggle({ aiHintsEnabled: false });
    fireEvent.click(toggle);
    expect(store.getState().userSettings.aiHintsEnabled).toBe(true);
    expect(updateUserSettings).toHaveBeenCalledWith(
      { ai_hints_enabled: true },
      "token",
    );
    expect(toggle).toBeChecked();
  });

  test("dispatches the toggled event when turned off", () => {
    const { toggle } = renderToggle();
    fireEvent.click(toggle);
    expect(aiHintToggledHandler).toHaveBeenCalledWith({
      projectIdentifier: "coach-gong-glide",
      enabled: false,
    });
  });

  test("dispatches the toggled event when turned on", () => {
    const { toggle } = renderToggle({ aiHintsEnabled: false });
    fireEvent.click(toggle);
    expect(aiHintToggledHandler).toHaveBeenCalledWith({
      projectIdentifier: "coach-gong-glide",
      enabled: true,
    });
  });

  test("dispatches the learn more link clicked event", () => {
    const handler = vi.fn();
    const onLearnMoreLinkClicked = (e) => handler(e.detail);
    document.addEventListener(
      "editor-aiHintLearnMoreLinkClicked",
      onLearnMoreLinkClicked,
    );
    renderToggle();
    fireEvent.click(screen.getByRole("link", { name: /learnMore/ }));
    document.removeEventListener(
      "editor-aiHintLearnMoreLinkClicked",
      onLearnMoreLinkClicked,
    );
    expect(handler).toHaveBeenCalledWith({
      projectIdentifier: "coach-gong-glide",
      source: "settings",
    });
  });

  test("is not focused when focus has not been requested", () => {
    const { toggle } = renderToggle();
    expect(toggle).not.toHaveFocus();
  });

  test("focuses itself and clears the request when focus is requested", () => {
    const { toggle, store } = renderToggle({ focusRequested: true });
    expect(toggle).toHaveFocus();
    expect(store.getState().editor.aiHintToggleFocusRequested).toBe(false);
  });
});
