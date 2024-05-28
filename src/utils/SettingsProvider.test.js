import { act, render, waitFor } from "@testing-library/react";
import { Cookies, CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SettingsProvider from "./SettingsProvider";
import { BrowserRouter, useLocation } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
}));

const mockStore = configureStore([]);
const initialState = {
  editor: {},
  auth: {},
};
const store = mockStore(initialState);

describe("When on a page that renders a project", () => {
  beforeEach(() => {
    useLocation.mockImplementation(() => ({
      pathname: "/en/projects/hello-world-solution",
      // other properties if needed
    }));
  });
  describe("Browser prefers light mode", () => {
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
    });

    test("Light mode class name added if no cookie", async () => {
      const { container } = render(
        <BrowserRouter>
          <CookiesProvider cookies={cookies}>
            <Provider store={store}>
              <SettingsProvider id="app" />
            </Provider>
          </CookiesProvider>
        </BrowserRouter>,
      );
      await waitFor(() => {
        const app = container.querySelector("#app");
        expect(app).toHaveClass("--light");
      });
    });

    test("Dark mode class name added if cookie specifies dark theme", async () => {
      cookies.set("theme", "dark");
      const { container } = render(
        <BrowserRouter>
          <CookiesProvider cookies={cookies}>
            <Provider store={store}>
              <SettingsProvider id="app" />
            </Provider>
          </CookiesProvider>
        </BrowserRouter>,
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
    });

    test("Dark mode class name added if no cookie", async () => {
      const { container } = render(
        <BrowserRouter>
          <CookiesProvider cookies={cookies}>
            <Provider store={store}>
              <SettingsProvider id="app" />
            </Provider>
          </CookiesProvider>
        </BrowserRouter>,
      );
      await waitFor(() => {
        const app = container.querySelector("#app");
        expect(app).toHaveClass("--dark");
      });
    });

    test("Light mode class name added if cookie specifies light theme", async () => {
      cookies.set("theme", "light");
      const { container } = render(
        <BrowserRouter>
          <CookiesProvider cookies={cookies}>
            <Provider store={store}>
              <SettingsProvider id="app" />
            </Provider>
          </CookiesProvider>
        </BrowserRouter>,
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
});

describe("When on a page that does not render a project", () => {
  let cookies;

  beforeEach(() => {
    useLocation.mockImplementation(() => ({
      pathname: "/en/schools",
    }));
    cookies = new Cookies();
    cookies.set("theme", "dark");
    render(
      <BrowserRouter>
        <CookiesProvider cookies={cookies}>
          <Provider store={store}>
            <SettingsProvider id="app" />
          </Provider>
        </CookiesProvider>
      </BrowserRouter>,
    );
  });
  test("renders in light mode", () => {
    const app = document.querySelector("#app");
    expect(app).toHaveClass("--light");
  });
  afterEach(() => {
    act(() => cookies.remove("theme"));
  });
});

describe("When the theme updated event is received", () => {
  beforeEach(() => {
    document.dispatchEvent(
      new CustomEvent("editor-themeUpdated", {
        detail: "dark",
      }),
    );
  });
  test("the theme cookie is updated", () => {
    const cookies = new Cookies();
    expect(cookies.get("theme")).toBe("dark");
  });
});
