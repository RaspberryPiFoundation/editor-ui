import App from "./App";
import { Provider } from "react-redux";
import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { Cookies, CookiesProvider } from "react-cookie";
import configureStore from "redux-mock-store";

jest.mock("./utils/Notifications");
jest.mock("./redux/EditorSlice", () => {
  const actual = jest.requireActual("./redux/EditorSlice");
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

  test("Light mode class name added if no cookie", async () => {
    const { container } = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    await waitFor(() => {
      const app = container.querySelector("#app");
      expect(app).toHaveClass("--light");
    });
  });

  test("Dark mode class name added if cookie specifies dark theme", async () => {
    cookies.set("theme", "dark");
    const { container } = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    await waitFor(() => {
      const app = container.querySelector("#app");
      expect(app).toHaveClass("--dark");
    });
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

  test("Dark mode class name added if no cookie", async () => {
    const { container } = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    await waitFor(() => {
      const app = container.querySelector("#app");
      expect(app).toHaveClass("--dark");
    });
  });

  test("Light mode class name added if cookie specifies light theme", async () => {
    cookies.set("theme", "light");
    const { container } = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    await waitFor(() => {
      const app = container.querySelector("#app");
      expect(app).toHaveClass("--light");
    });
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

  test("Renders beta banner if betaBannerDismissed cookie not set", async () => {
    render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    await waitFor(() => {
      const app = screen.queryByText("betaBanner.message");
      expect(app).toBeInTheDocument();
    });
  });

  test("Does not render beta banner if betaBannerDismissed cookie is true", async () => {
    cookies.set("betaBannerDismissed", "true");
    render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>,
    );
    await waitFor(() => {
      const app = screen.queryByText("betaBanner.message");
      expect(app).not.toBeInTheDocument();
    });
  });

  afterEach(() => {
    act(() => cookies.remove("betaBannerDismissed"));
  });
});
