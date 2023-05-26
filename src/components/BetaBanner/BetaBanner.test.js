import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Cookies, CookiesProvider } from "react-cookie";
import BetaBanner from "./BetaBanner";

let cookies;
let store;

beforeEach(() => {
  cookies = new Cookies();
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {};
  store = mockStore(initialState);
  render(
    <CookiesProvider cookies={cookies}>
      <Provider store={store}>
        <BetaBanner />
      </Provider>
    </CookiesProvider>,
  );
});

test("Banner shows", () => {
  expect(screen.queryByText("betaBanner.message")).toBeInTheDocument();
});

test("Clicking close button sets cookie", () => {
  const closeButton = screen.getAllByRole("button").pop();
  fireEvent.click(closeButton);
  expect(cookies.cookies.betaBannerDismissed).toBe("true");
});

test("Clicking link dispatches modal action", () => {
  const modalLink = screen.queryByText("betaBanner.modalLink");
  fireEvent.click(modalLink);
  expect(store.getActions()).toEqual([{ type: "editor/showBetaModal" }]);
});

afterEach(() => {
  cookies.remove("betaBannerDismissed");
});
