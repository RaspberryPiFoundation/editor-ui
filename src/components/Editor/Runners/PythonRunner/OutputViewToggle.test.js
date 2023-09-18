import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import OutputViewToggle from "./OutputViewToggle";
import { setIsSplitView } from "../../EditorSlice";

describe("When in tabbed view", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        isSplitView: false,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <OutputViewToggle />
      </Provider>,
    );
  });

  test("Split view button is shown", () => {
    expect(screen.getByRole("button")).toHaveTextContent(
      "outputViewToggle.buttonSplitLabel",
    );
  });

  test("Split view button is enabled", () => {
    expect(screen.getByRole("button")).toBeEnabled();
  });

  test("Clicking split view icon switches to split view", () => {
    fireEvent.click(screen.getByRole("button"));
    const expectedActions = [setIsSplitView(true)];
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe("When in split view", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        isSplitView: true,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <OutputViewToggle />
      </Provider>,
    );
  });

  test("Tabbed view button is shown", () => {
    expect(screen.getByRole("button")).toHaveTextContent(
      "outputViewToggle.buttonTabLabel",
    );
  });

  test("Tabbed view button is enabled", () => {
    expect(screen.getByRole("button")).toBeEnabled();
  });

  test("Clicking tabbed view icon switches to tabbed view", () => {
    fireEvent.click(screen.getByRole("button"));
    const expectedActions = [setIsSplitView(false)];
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe("When in a code run is triggered", () => {
  describe("In tabbed view", () => {
    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          codeRunTriggered: true,
          isSplitView: false,
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <OutputViewToggle />
        </Provider>,
      );
    });
    test("Split view button is disabled", () => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("In split view", () => {
    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          codeRunTriggered: true,
          isSplitView: true,
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <OutputViewToggle />
        </Provider>,
      );
    });
    test("Tabbed view button is disabled", () => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});

describe("When in a draw is triggered", () => {
  describe("In tabbed view", () => {
    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          drawTriggered: true,
          isSplitView: false,
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <OutputViewToggle />
        </Provider>,
      );
    });
    test("Split view button is disabled", () => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("In split view", () => {
    beforeEach(() => {
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          drawTriggered: true,
          isSplitView: true,
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <OutputViewToggle />
        </Provider>,
      );
    });
    test("Tabbed view button is disabled", () => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
