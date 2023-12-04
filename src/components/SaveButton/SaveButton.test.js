import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { triggerSave } from "../../redux/EditorSlice";
import SaveButton from "./SaveButton";

const logInHandler = jest.fn();

beforeAll(() => {
  document.addEventListener("editor-logIn", logInHandler);
});

describe("When project is loaded", () => {
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

    test("Save button renders", () => {
      expect(screen.queryByText("header.save")).toBeInTheDocument();
    });

    test("Clicking save dispatches trigger save action", () => {
      const saveButton = screen.queryByText("header.save");
      fireEvent.click(saveButton);
      expect(store.getActions()).toEqual([triggerSave()]);
    });

    test("renders a secondary button", () => {
      const saveButton = screen.queryByText("header.save").parentElement;
      expect(saveButton).toHaveClass("btn--secondary");
    });

    test("Clicking save triggers a logInHandler event", () => {
      const saveButton = screen.queryByText("header.save").parentElement;
      fireEvent.click(saveButton);
      expect(logInHandler).toHaveBeenCalled();
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

    test("Save button renders", () => {
      expect(screen.queryByText("header.save")).toBeInTheDocument();
    });

    test("Clicking save dispatches trigger save action", () => {
      const saveButton = screen.queryByText("header.save");
      fireEvent.click(saveButton);
      expect(store.getActions()).toEqual([triggerSave()]);
    });

    test("renders a primary button", () => {
      const saveButton = screen.queryByText("header.save").parentElement;
      expect(saveButton).toHaveClass("btn--primary");
    });

    test("Clicking save triggers a logInHandler event", () => {
      const saveButton = screen.queryByText("header.save").parentElement;
      fireEvent.click(saveButton);
      expect(logInHandler).toHaveBeenCalled();
    });
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
  test("Does not render save button", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });
});

describe("With an auth object", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        loading: "success",
        webComponent: true,
      },
      auth: {
        user: {
          access_token: "some-dummy-token",
        },
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SaveButton />
      </Provider>,
    );
  });

  test("Clicking save does not trigger a logInHandler event", () => {
    const saveButton = screen.queryByText("header.save").parentElement;
    fireEvent.click(saveButton);
    expect(logInHandler).not.toHaveBeenCalled();
  });
});

afterAll(() => {
  document.removeEventListener("editor-logIn", logInHandler);
});
