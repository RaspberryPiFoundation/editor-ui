import React from "react";
import Modal from "react-modal";
import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import InputModal from "./InputModal";

let inputBox;

beforeAll(() => {
  const root = global.document.createElement("div");
  root.setAttribute("id", "app");
  global.document.body.appendChild(root);
  Modal.setAppElement("#app");
});

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      nameError: "",
    },
  };
  const store = mockStore(initialState);

  render(
    <Provider store={store}>
      <InputModal
        isOpen={true}
        inputs={[
          {
            label: "input",
            helpText: "help me",
            value: "my amazing default",
          },
        ]}
      />
    </Provider>,
  );
  inputBox = screen.getByLabelText(/input/);
});

test("Renders help text", () => {
  expect(screen.queryByText("help me")).toBeInTheDocument();
});

test("Input renders with default value", () => {
  expect(inputBox).toHaveValue("my amazing default");
});
