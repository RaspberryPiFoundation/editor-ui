import React from "react";
import { act, render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Cookies, CookiesProvider } from "react-cookie";
import FontSizeSelector from "./FontSizeSelector";
import rootReducer from "../../../../../redux/RootSlice";

describe("When no font size is set", () => {
  let store;
  let cookies;

  beforeEach(() => {
    store = configureStore({ reducer: rootReducer });
    cookies = new Cookies();
    render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <FontSizeSelector />
        </Provider>
      </CookiesProvider>,
    );
  });

  afterEach(() => {
    act(() => {
      cookies.remove("fontSize", { path: "/" });
    });
  });

  test("Does not set a cookie on render", () => {
    expect(cookies.get("fontSize")).toBeUndefined();
  });

  test.each(["large", "medium"])(
    "Sets font size to %s when button clicked",
    (size) => {
      fireEvent.click(
        screen.getByText(`sidebar.settingsMenu.textSizeOptions.${size}`),
      );
      expect(store.getState().userSettings.fontSize).toBe(size);
      expect(cookies.get("fontSize")).toBe(size);
    },
  );
});
