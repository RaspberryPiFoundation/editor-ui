import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import MobileProject from "./MobileProject";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

const middlewares = [];
const mockStore = configureStore(middlewares);

describe("When code is not running", () => {
  beforeEach(() => {
    const initialState = {
      editor: {
        project: {
          project_type: "python",
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello')",
            },
          ],
        },
        codeRunTriggered: false,
        openFiles: [["main.py"]],
        focussedFileIndices: [0],
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MobileProject />
      </Provider>,
    );
  });

  test("renders the code", () => {
    const codeTab = screen.getByText("mobile.code").parentElement;
    expect(codeTab).toHaveClass("react-tabs__tab--selected");
  });
});

describe("When code is running", () => {
  beforeEach(() => {
    const initialState = {
      editor: {
        project: {
          project_type: "python",
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello')",
            },
          ],
        },
        codeRunTriggered: true,
        openFiles: [["main.py"]],
        focussedFileIndices: [0],
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MobileProject />
      </Provider>,
    );
  });

  test("renders the output", () => {
    const outputTab = screen.getByText("mobile.output").parentElement;
    expect(outputTab).toHaveClass("react-tabs__tab--selected");
  });
});
