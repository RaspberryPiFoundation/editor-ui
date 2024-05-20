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
