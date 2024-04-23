import React from "react";
import Modal from "react-modal";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import LoginToSaveModal from "./LoginToSaveModal";

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
}));

const middlewares = [];
const mockStore = configureStore(middlewares);

describe("When loginToSaveModalShowing is true", () => {
  let store;

  beforeAll(() => {
    const root = global.document.createElement("div");
    root.setAttribute("id", "app");
    global.document.body.appendChild(root);
    Modal.setAppElement("#app");
  });

  beforeEach(() => {
    const initialState = {
      editor: {
        loginToSaveModalShowing: true,
        modals: {},
      },
    };
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <LoginToSaveModal />
      </Provider>,
    );
  });

  test("Modal rendered", () => {
    expect(screen.queryByText("loginToSaveModal.heading")).toBeInTheDocument();
  });

  test("Clicking cancel dispatches close modal action", () => {
    const cancelLink = screen.queryByText("loginToSaveModal.cancel");
    fireEvent.click(cancelLink);
    expect(store.getActions()).toEqual([
      { type: "editor/closeLoginToSaveModal" },
    ]);
  });
});
