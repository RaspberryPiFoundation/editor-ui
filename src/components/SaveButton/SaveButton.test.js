import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { triggerSave } from "../../redux/EditorSlice";
import SaveButton from "./SaveButton";
import "../../consoleMock"

const logInHandler = jest.fn();

describe("When project is loaded", () => {
  beforeAll(() => {
    document.addEventListener("editor-logIn", logInHandler);
  });

  describe("With logged in user", () => {
    let store;

    describe("who doesn't own the project", () => {
      beforeEach(() => {
        const middlewares = [];
        const mockStore = configureStore(middlewares);
        const initialState = {
          editor: {
            loading: "success",
            webComponent: true,
            project: {
              identifier: "hot-diggity-dog",
              user_id: "some-other-user",
            },
          },
          auth: {
            user: {
              profile: {
                user: "some-dummy-user",
              },
            },
          },
        };
        store = mockStore(initialState);
        render(
          <Provider store={store}>
            <SaveButton />
          </Provider>,
        );
      });

      test("Save button renders", () => {
        expect(screen.queryByText("header.save")).toBeInTheDocument();
      });

      test("Does not render a login to save button", () => {
        expect(
          screen.queryByText("header.loginToSave"),
        ).not.toBeInTheDocument();
      });

      test("Clicking save dispatches trigger save action", () => {
        const saveButton = screen.queryByText("header.save");
        fireEvent.click(saveButton);
        expect(store.getActions()).toEqual([triggerSave()]);
      });

      test("Clicking save triggers a logInHandler event", () => {
        const saveButton = screen.queryByText("header.save").parentElement;
        fireEvent.click(saveButton);
        expect(logInHandler).toHaveBeenCalled();
      });
    });

    describe("who does own the project", () => {
      beforeEach(() => {
        const middlewares = [];
        const mockStore = configureStore(middlewares);
        const initialState = {
          editor: {
            loading: "success",
            webComponent: true,
            project: {
              identifier: "hot-diggity-dog",
              user_id: "some-dummy-user",
            },
          },
          auth: {
            user: {
              profile: {
                user: "some-dummy-user",
              },
            },
          },
        };
        store = mockStore(initialState);
        render(
          <Provider store={store}>
            <SaveButton />
          </Provider>,
        );
      });

      test("Does not render save button", () => {
        expect(screen.queryByText("header.save")).not.toBeInTheDocument();
      });

      test("Does not render a login to save button", () => {
        expect(
          screen.queryByText("header.loginToSave"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Without a logged in user", () => {
    let store;

    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          loading: "success",
          webComponent: false,
        },
        auth: {},
      };
      store = mockStore(initialState);
      render(
        <Provider store={store}>
          <SaveButton />
        </Provider>,
      );
    });

    test("Login to save button renders", () => {
      expect(screen.queryByText("header.loginToSave")).toBeInTheDocument();
    });

    test("Does not render a save button", () => {
      expect(screen.queryByText("header.save")).not.toBeInTheDocument();
    });

    test("Clicking save dispatches trigger save action", () => {
      const saveButton = screen.queryByText("header.loginToSave");
      fireEvent.click(saveButton);
      expect(store.getActions()).toEqual([triggerSave()]);
    });

    test("Clicking save triggers a logInHandler event", () => {
      const saveButton = screen.queryByText("header.loginToSave").parentElement;
      fireEvent.click(saveButton);
      expect(logInHandler).toHaveBeenCalled();
    });
  });

  describe("with webComponent=false", () => {
    let store;

    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          loading: "success",
          webComponent: false,
        },
        auth: {},
      };
      store = mockStore(initialState);
      render(
        <Provider store={store}>
          <SaveButton />
        </Provider>,
      );
    });

    test("Renders a secondary button", () => {
      const saveButton = screen.queryByText("header.loginToSave").parentElement;
      expect(saveButton).toHaveClass("btn--secondary");
    });
  });

  describe("with webComponent=true", () => {
    let store;

    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          loading: "success",
          webComponent: true,
        },
        auth: {},
      };
      store = mockStore(initialState);
      render(
        <Provider store={store}>
          <SaveButton />
        </Provider>,
      );
    });

    test("Renders a primary button", () => {
      const saveButton = screen.queryByText("header.loginToSave").parentElement;
      expect(saveButton).toHaveClass("btn--primary");
    });
  });

  afterAll(() => {
    document.removeEventListener("editor-logIn", logInHandler);
  });
});

describe("When project is not loaded", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const store = mockStore({
      editor: {},
      auth: {},
    });
    render(
      <Provider store={store}>
        <SaveButton />
      </Provider>,
    );
  });

  test("Does not render a login to save button", () => {
    expect(screen.queryByText("header.loginToSave")).not.toBeInTheDocument();
  });

  test("Does not render a save button", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });
});
