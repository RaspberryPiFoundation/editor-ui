import App from "./App";
import { Provider } from "react-redux";
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { Cookies, CookiesProvider } from "react-cookie";
import configureStore from "redux-mock-store";

jest.mock("./utils/Notifications");
jest.mock("./components/Editor/EditorSlice", () => {
  const actual = jest.requireActual("./components/Editor/EditorSlice");
  return {
    ...actual,
    saveProject: jest.fn(),
  };
});

describe("Browser prefers light mode", () => {
  let store;
  let cookies;

  beforeEach(() => {
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

    cookies = new Cookies();
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {},
      auth: {},
    };
    store = mockStore(initialState);
  });

  test("Light mode class name added if no cookie", () => {
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    expect(appContainer.container.querySelector("#app")).toHaveClass("--light");
  });

  test("Dark mode class name added if cookie specifies dark theme", () => {
    cookies.set("theme", "dark");
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    expect(appContainer.container.querySelector("#app")).toHaveClass("--dark");
  });

  afterEach(() => {
    act(() => cookies.remove("theme"));
  });
});

describe("Browser prefers dark mode", () => {
  let cookies;
  let store;

  beforeEach(() => {
    window.matchMedia = (query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
    cookies = new Cookies();
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {},
      auth: {},
    };
    store = mockStore(initialState);
  });

  test("Dark mode class name added if no cookie", () => {
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    expect(appContainer.container.querySelector("#app")).toHaveClass("--dark");
  });

  test("Light mode class name added if cookie specifies light theme", () => {
    cookies.set("theme", "light");
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    expect(appContainer.container.querySelector("#app")).toHaveClass("--light");
  });

  afterEach(() => {
    act(() => cookies.remove("theme"));
  });
});

describe("Beta banner", () => {
  let cookies;
  let store;

  beforeEach(() => {
    cookies = new Cookies();
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {},
      auth: {},
    };
    store = mockStore(initialState);
  });

  test("Renders beta banner if betaBannerDismissed cookie not set", () => {
    render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    expect(screen.queryByText("betaBanner.message")).toBeInTheDocument();
  });

  test("Does not render beta banner if betaBannerDismissed cookie is true", () => {
    cookies.set("betaBannerDismissed", "true");
    render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    expect(screen.queryByText("betaBanner.message")).not.toBeInTheDocument();
  });

  afterEach(() => {
    act(() => cookies.remove("betaBannerDismissed"));
  });
});
