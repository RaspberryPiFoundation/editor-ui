import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { triggerSave } from "../../redux/EditorSlice";
import SaveButton from "./SaveButton";
import useIsOnline from "../../hooks/useIsOnline";

jest.mock("../../hooks/useIsOnline");

const logInHandler = jest.fn();

describe("When project is loaded", () => {
  beforeAll(() => {
    document.addEventListener("editor-logIn", logInHandler);
  });

  beforeEach(() => {
    useIsOnline.mockReturnValue(true);
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

    describe("who doesn't own the project and save is disabled", () => {
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
            saveDisabled: true,
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

  describe("offline badge", () => {
    const offlineState = {
      editor: {
        loading: "success",
        webComponent: true,
        offlineEnabled: true,
        project: {},
      },
      auth: {},
    };

    beforeEach(() => {
      useIsOnline.mockReturnValue(false);
    });

    test("shows offline badge when offline and offlineEnabled is true", () => {
      const store = configureStore([])(offlineState);
      render(
        <Provider store={store}>
          <SaveButton />
        </Provider>,
      );
      expect(screen.queryByText("header.offline")).toBeInTheDocument();
    });

    test("does not show offline badge when offlineEnabled is false", () => {
      const store = configureStore([])({
        ...offlineState,
        editor: { ...offlineState.editor, offlineEnabled: false },
      });
      render(
        <Provider store={store}>
          <SaveButton />
        </Provider>,
      );
      expect(screen.queryByText("header.offline")).not.toBeInTheDocument();
    });

    test("does not show offline badge when online, even if offlineEnabled is true", () => {
      useIsOnline.mockReturnValue(true);
      const store = configureStore([])(offlineState);
      render(
        <Provider store={store}>
          <SaveButton />
        </Provider>,
      );
      expect(screen.queryByText("header.offline")).not.toBeInTheDocument();
    });

    test("shows offline badge when user is logged in and offline", () => {
      const store = configureStore([])({
        ...offlineState,
        editor: {
          ...offlineState.editor,
          project: { identifier: "some-project", user_id: "some-other-user" },
        },
        auth: { user: { profile: { user: "some-user" } } },
      });
      render(
        <Provider store={store}>
          <SaveButton />
        </Provider>,
      );
      expect(screen.queryByText("header.offline")).toBeInTheDocument();
    });

    describe("accessibility", () => {
      beforeEach(() => {
        const store = configureStore([])(offlineState);
        render(
          <Provider store={store}>
            <SaveButton />
          </Provider>,
        );
      });

      test("badge is keyboard focusable", () => {
        const badge = screen.getByText("header.offline").parentElement;
        expect(badge).toHaveAttribute("tabIndex", "0");
      });

      test("badge tooltip is associated via aria-describedby", () => {
        const tooltip = screen.getByRole("tooltip");
        const badge = screen.getByText("header.offline").parentElement;
        expect(badge).toHaveAttribute("aria-describedby", tooltip.id);
      });
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
