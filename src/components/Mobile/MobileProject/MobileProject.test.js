import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import MobileProject from "./MobileProject";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

const middlewares = [];
const mockStore = configureStore(middlewares);

const user = {
  access_token: "myAccessToken",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

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
          user_id: user.profile.user,
        },
        codeRunTriggered: false,
        openFiles: [["main.py"]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user,
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
          user_id: user.profile.user,
        },
        codeRunTriggered: true,
        openFiles: [["main.py"]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user,
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
