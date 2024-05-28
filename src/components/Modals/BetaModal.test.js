import React from "react";
import Modal from "react-modal";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import BetaModal from "./BetaModal";

const middlewares = [];
const mockStore = configureStore(middlewares);

beforeAll(() => {
  const root = global.document.createElement("div");
  root.setAttribute("id", "app");
  global.document.body.appendChild(root);
  Modal.setAppElement("#app");
});

test("Modal rendered when betaModalShowing is true", () => {
  const initialState = {
    editor: {
      betaModalShowing: true,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <BetaModal />
    </Provider>,
  );

  expect(screen.queryByText("betaBanner.modal.heading")).toBeInTheDocument();
});

test("Clicking close dispatches close modal action", () => {
  const initialState = {
    editor: {
      betaModalShowing: true,
    },
  };
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <BetaModal />
    </Provider>,
  );

  const closeButton = screen.queryByText("betaBanner.modal.close");
  fireEvent.click(closeButton);
  expect(store.getActions()).toEqual([{ type: "editor/closeBetaModal" }]);
});
