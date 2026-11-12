import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Cookies, CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import AiHintToggle from "./AiHintToggle";

const mockStore = configureStore([]);

const renderToggle = (cookieValue, { focusRequested = false } = {}) => {
  const cookies = new Cookies();
  if (cookieValue) cookies.set("aiHint", cookieValue);
  const store = mockStore({
    editor: { aiHintToggleFocusRequested: focusRequested },
  });
  render(
    <Provider store={store}>
      <CookiesProvider cookies={cookies}>
        <AiHintToggle />
      </CookiesProvider>
    </Provider>,
  );
  return { cookies, store, toggle: screen.getByRole("switch") };
};

describe("AiHintToggle", () => {
  afterEach(() => {
    new Cookies().remove("aiHint", { path: "/" });
  });

  test("is on by default", () => {
    const { toggle } = renderToggle();
    expect(toggle).toBeChecked();
  });

  test("is off when the cookie is set to off", () => {
    const { toggle } = renderToggle("off");
    expect(toggle).not.toBeChecked();
  });

  test("sets the cookie to off when turned off", () => {
    const { cookies, toggle } = renderToggle();
    fireEvent.click(toggle);
    expect(cookies.get("aiHint")).toBe("off");
    expect(toggle).not.toBeChecked();
  });

  test("sets the cookie to on when turned back on", () => {
    const { cookies, toggle } = renderToggle("off");
    fireEvent.click(toggle);
    expect(cookies.get("aiHint")).toBe("on");
    expect(toggle).toBeChecked();
  });

  test("is not focused when focus has not been requested", () => {
    const { toggle } = renderToggle();
    expect(toggle).not.toHaveFocus();
  });

  test("focuses itself and clears the request when focus is requested", () => {
    const { toggle, store } = renderToggle(undefined, {
      focusRequested: true,
    });
    expect(toggle).toHaveFocus();
    expect(store.getActions()).toContainEqual({
      type: "editor/clearAiHintToggleFocusRequest",
      payload: undefined,
    });
  });
});
