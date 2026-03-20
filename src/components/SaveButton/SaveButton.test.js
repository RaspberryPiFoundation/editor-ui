import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { triggerSave } from "../../redux/EditorSlice";
import SaveButton from "./SaveButton";
import { postMessageToScratchIframe } from "../../utils/scratchIframe";

jest.mock("../../utils/scratchIframe", () => ({
  postMessageToScratchIframe: jest.fn(),
  shouldRemixScratchProjectOnSave: jest.requireActual(
    "../../utils/scratchIframe",
  ).shouldRemixScratchProjectOnSave,
}));

const logInHandler = jest.fn();

describe("When project is loaded", () => {
  beforeAll(() => {
    document.addEventListener("editor-logIn", logInHandler);
  });

  describe("With logged in user", () => {
    let store;

    beforeEach(() => {
      jest.clearAllMocks();
    });

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

      test("clicking save remixes the first save of a Scratch project", () => {
        const middlewares = [];
        const mockStore = configureStore(middlewares);
        const scratchStore = mockStore({
          editor: {
            loading: "success",
            webComponent: true,
            scratchIframeProjectIdentifier: "teacher-project",
            project: {
              identifier: "teacher-project",
              user_id: "teacher-id",
              project_type: "code_editor_scratch",
            },
          },
          auth: {
            user: {
              profile: {
                user: "student-id",
              },
            },
          },
        });

        render(
          <Provider store={scratchStore}>
            <SaveButton />
          </Provider>,
        );

        fireEvent.click(screen.getAllByText("header.save")[1]);

        expect(postMessageToScratchIframe).toHaveBeenCalledWith({
          type: "scratch-gui-remix",
        });
        expect(scratchStore.getActions()).toEqual([]);
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
      jest.clearAllMocks();
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
      jest.clearAllMocks();
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
      jest.clearAllMocks();
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
