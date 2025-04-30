import { render, act } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentLoader from "./WebComponentLoader";
import {
  disableTheming,
  setReadOnly,
  setSenseHatAlwaysEnabled,
  setReactAppApiEndpoint,
} from "../redux/EditorSlice";
import { setInstructions } from "../redux/InstructionsSlice";
import { setUser } from "../redux/WebComponentAuthSlice";
import { useProject } from "../hooks/useProject";
import { useProjectPersistence } from "../hooks/useProjectPersistence";
import localStorageUserMiddleware from "../redux/middlewares/localStorageUserMiddleware";
import { Cookies, CookiesProvider } from "react-cookie";

jest.mock("../hooks/useProject", () => ({
  useProject: jest.fn(),
}));

jest.mock("../hooks/useProjectPersistence", () => ({
  useProjectPersistence: jest.fn(),
}));

let store;
let cookies;
const code = "print('This project is amazing')";
const identifier = "My amazing project";
const steps = [{ quiz: false, title: "Step 1", content: "Do something" }];
const instructions = {
  currentStepPosition: 3,
  project: { steps: steps },
  permitOverride: false,
};
const authKey = "my_key";
const user = { access_token: "my_token" };

describe("When initially rendered", () => {
  beforeEach(() => {
    document.dispatchEvent = jest.fn();
    window.Prism = jest.fn();
    const middlewares = [localStorageUserMiddleware(setUser)];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        loading: "success",
        project: {
          components: [],
          user_name: "Joe Bloggs",
        },
        openFiles: [],
        focussedFileIndices: [],
        justLoaded: true,
      },
      instructions: {},
      auth: {},
    };
    store = mockStore(initialState);
    cookies = new Cookies();
    render(
      <Provider store={store}>
        <CookiesProvider cookies={cookies}>
          <WebComponentLoader
            code={code}
            identifier={identifier}
            senseHatAlwaysEnabled={true}
            instructions={instructions}
            authKey={authKey}
            theme="light"
          />
        </CookiesProvider>
      </Provider>,
    );
  });

  test("It fires the projectOwnerLoadedEvent with correct name", () => {
    expect(document.dispatchEvent).toHaveBeenCalledWith(
      new CustomEvent("editor-projectOwnerLoaded", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { user_name: "Joe Bloggs" },
      }),
    );
  });

  test("It saves window.Prism to window.syntaxHighlight", () => {
    expect(window.syntaxHighlight).toEqual(window.Prism);
  });

  describe("react app API endpoint", () => {
    describe("when react app API endpoint isn't set", () => {
      beforeEach(() => {
        render(
          <Provider store={store}>
            <CookiesProvider cookies={cookies}>
              <WebComponentLoader
                code={code}
                identifier={identifier}
                senseHatAlwaysEnabled={true}
                instructions={instructions}
                readOnly={true}
                authKey={authKey}
                theme="light"
              />
            </CookiesProvider>
          </Provider>,
        );
      });

      test("it defaults", () => {
        expect(store.getActions()).toEqual(
          expect.arrayContaining([
            setReactAppApiEndpoint("http://localhost:3009"),
          ]),
        );
      });
    });

    describe("when react app API endpoint is set", () => {
      beforeEach(() => {
        render(
          <Provider store={store}>
            <CookiesProvider cookies={cookies}>
              <WebComponentLoader
                code={code}
                identifier={identifier}
                senseHatAlwaysEnabled={true}
                instructions={instructions}
                readOnly={true}
                authKey={authKey}
                reactAppApiEndpoint="http://local.dev"
                theme="light"
              />
            </CookiesProvider>
          </Provider>,
        );
      });

      test("it uses the specified prop", () => {
        expect(store.getActions()).toEqual(
          expect.arrayContaining([setReactAppApiEndpoint("http://local.dev")]),
        );
      });
    });
  });
});

describe("When no user is in state", () => {
  beforeEach(() => {
    const middlewares = [localStorageUserMiddleware(setUser)];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        loading: "success",
        project: {
          components: [],
        },
        openFiles: [],
        focussedFileIndices: [],
        hasShownSavePrompt: false,
        remixLoadFailed: false,
        justLoaded: false,
        saveTriggered: false,
      },
      instructions: {},
      auth: {},
    };
    store = mockStore(initialState);
    cookies = new Cookies();
  });

  describe("with no user in local storage", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <CookiesProvider cookies={cookies}>
            <WebComponentLoader
              code={code}
              identifier={identifier}
              senseHatAlwaysEnabled={true}
              instructions={instructions}
              readOnly={true}
              authKey={authKey}
              theme="light"
            />
          </CookiesProvider>
        </Provider>,
      );
    });

    test("Calls useProject hook with correct attributes", () => {
      expect(useProject).toHaveBeenCalledWith({
        assetsIdentifier: undefined,
        projectIdentifier: identifier,
        code,
        accessToken: undefined,
        loadRemix: false,
        loadCache: true,
        remixLoadFailed: false,
        reactAppApiEndpoint: "http://localhost:3009",
      });
    });

    test("Calls useProjectPersistence hook with correct attributes", () => {
      expect(useProjectPersistence).toHaveBeenCalledWith({
        project: {
          components: [],
        },
        loadRemix: false,
        hasShownSavePrompt: true,
        justLoaded: false,
        user: null,
        saveTriggered: false,
        reactAppApiEndpoint: "http://localhost:3009",
      });
    });

    test("Enables the SenseHat", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([setSenseHatAlwaysEnabled(true)]),
      );
    });

    test("Sets the instructions", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([setInstructions(instructions)]),
      );
    });

    test("Sets the read only state correctly", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([setReadOnly(true)]),
      );
    });

    test("Disables theming", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([disableTheming()]),
      );
    });

    test("Sets theme correctly", () => {
      expect(cookies.cookies.theme).toEqual("light");
    });

    test("Sets the user in state", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([setUser(null)]),
      );
    });

    test("Renders editor styles when useEditorStyles is true", () => {
      const { container } = render(
        <Provider store={store}>
          <CookiesProvider cookies={cookies}>
            <WebComponentLoader
              code={code}
              identifier={identifier}
              senseHatAlwaysEnabled={true}
              instructions={instructions}
              authKey={authKey}
              theme="light"
              useEditorStyles={true}
            />
          </CookiesProvider>
        </Provider>,
      );

      const styleTags = container.querySelectorAll("style");
      const editorStyles = Array.from(styleTags).find((tag) =>
        tag.textContent.includes("editorStyles"),
      );
      expect(editorStyles).not.toBeNull();
    });
  });

  describe("with assetsIdentifier set", () => {
    const assetsIdentifier = "my-assets-identifier";

    beforeEach(() => {
      render(
        <Provider store={store}>
          <CookiesProvider cookies={cookies}>
            <WebComponentLoader
              code={code}
              assetsIdentifier={assetsIdentifier}
              senseHatAlwaysEnabled={true}
              instructions={instructions}
              authKey={authKey}
              theme="light"
            />
          </CookiesProvider>
        </Provider>,
      );
    });

    test("Calls useProject hook with correct attributes", () => {
      expect(useProject).toHaveBeenCalledWith({
        assetsIdentifier: assetsIdentifier,
        code,
        accessToken: undefined,
        loadRemix: false,
        loadCache: true,
        remixLoadFailed: false,
        reactAppApiEndpoint: "http://localhost:3009",
      });
    });
  });

  describe("with user set in local storage", () => {
    beforeEach(() => {
      localStorage.setItem(authKey, JSON.stringify(user));
      localStorage.setItem("authKey", authKey);
      render(
        <Provider store={store}>
          <CookiesProvider cookies={cookies}>
            <WebComponentLoader
              code={code}
              identifier={identifier}
              senseHatAlwaysEnabled={true}
              instructions={instructions}
              authKey={authKey}
              theme="light"
              loadCache={true}
            />
          </CookiesProvider>
        </Provider>,
      );
    });

    test("Calls useProject hook with correct attributes", () => {
      expect(useProject).toHaveBeenCalledWith({
        assetsIdentifier: undefined,
        projectIdentifier: identifier,
        code,
        accessToken: "my_token",
        loadRemix: true,
        loadCache: true,
        remixLoadFailed: false,
        reactAppApiEndpoint: "http://localhost:3009",
      });
    });

    test("Calls useProjectPersistence hook with correct attributes", () => {
      expect(useProjectPersistence).toHaveBeenCalledWith({
        user,
        project: { components: [] },
        loadRemix: true,
        hasShownSavePrompt: true,
        justLoaded: false,
        saveTriggered: false,
        reactAppApiEndpoint: "http://localhost:3009",
      });
    });

    test("Sets the instructions", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([setInstructions(instructions)]),
      );
    });

    test("Sets the user", () => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([setUser(user)]),
      );
    });
  });

  describe("When theme is not set", () => {
    beforeEach(() => {
      render(
        <Provider store={store}>
          <CookiesProvider cookies={cookies}>
            <WebComponentLoader />
          </CookiesProvider>
        </Provider>,
      );
    });

    test("Does not disable theming", () => {
      expect(store.getActions()).not.toEqual(
        expect.arrayContaining([disableTheming()]),
      );
    });

    test("Does not set the theme", () => {
      expect(cookies.cookies.theme).toBeUndefined();
    });
  });

  afterEach(async () => {
    localStorage.clear();
    await act(async () => cookies.remove("theme"));
  });
});

describe("When user is in state", () => {
  describe("before a remix load attempt", () => {
    beforeEach(() => {
      localStorage.setItem(authKey, JSON.stringify(user));
      const middlewares = [localStorageUserMiddleware(setUser)];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          loading: "idle",
          project: {
            components: [],
          },
          openFiles: [],
          focussedFileIndices: [],
          hasShownSavePrompt: false,
          remixLoadFailed: false,
          justLoaded: false,
          saveTriggered: false,
        },
        instructions: {},
        auth: { user },
      };
      store = mockStore(initialState);
      cookies = new Cookies();
    });

    describe("when user in local storage is removed", () => {
      beforeEach(() => {
        localStorage.removeItem(authKey);
        render(
          <Provider store={store}>
            <CookiesProvider cookies={cookies}>
              <WebComponentLoader authKey={authKey} />
            </CookiesProvider>
          </Provider>,
        );
      });

      test("Removes the user from state", () => {
        expect(store.getActions()).toEqual(
          expect.arrayContaining([setUser(null)]),
        );
      });
    });

    describe("when user is set in local storage", () => {
      beforeEach(() => {
        render(
          <Provider store={store}>
            <CookiesProvider cookies={cookies}>
              <WebComponentLoader
                identifier={identifier}
                instructions={instructions}
                authKey={authKey}
                theme="light"
                loadRemixDisabled={false}
              />
            </CookiesProvider>
          </Provider>,
        );
      });

      test("Calls useProject hook with correct attributes", () => {
        expect(useProject).toHaveBeenCalledWith({
          assetsIdentifier: undefined,
          projectIdentifier: identifier,
          code: undefined,
          accessToken: "my_token",
          loadRemix: true,
          loadCache: true,
          remixLoadFailed: false,
          reactAppApiEndpoint: "http://localhost:3009",
        });
      });

      describe("when loadRemixDisabled is true", () => {
        beforeEach(() => {
          render(
            <Provider store={store}>
              <CookiesProvider cookies={cookies}>
                <WebComponentLoader
                  identifier={identifier}
                  instructions={instructions}
                  authKey={authKey}
                  theme="light"
                  loadRemixDisabled={true}
                />
              </CookiesProvider>
            </Provider>,
          );
        });

        test("Calls useProject hook with loadRemix set to false, i.e. it is overidden", () => {
          expect(useProject).toHaveBeenCalledWith({
            assetsIdentifier: undefined,
            projectIdentifier: identifier,
            code: undefined,
            accessToken: "my_token",
            loadRemix: false,
            loadCache: true,
            remixLoadFailed: false,
            reactAppApiEndpoint: "http://localhost:3009",
          });
        });
      });

      test("Calls useProjectPersistence hook with correct attributes", () => {
        expect(useProjectPersistence).toHaveBeenCalledWith({
          reactAppApiEndpoint: "http://localhost:3009",
          user,
          project: { components: [] },
          loadRemix: true,
          hasShownSavePrompt: true,
          justLoaded: false,
          saveTriggered: false,
        });
      });

      test("Sets the instructions", () => {
        expect(store.getActions()).toEqual(
          expect.arrayContaining([setInstructions(instructions)]),
        );
      });
    });

    afterEach(async () => {
      localStorage.clear();
      await act(async () => cookies.remove("theme"));
    });
  });

  describe("after a remix load has failed", () => {
    beforeEach(() => {
      localStorage.setItem(authKey, JSON.stringify(user));
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          loading: "failed",
          project: {
            components: [],
          },
          openFiles: [],
          focussedFileIndices: [],
          hasShownSavePrompt: false,
          remixLoadFailed: true,
          justLoaded: false,
          saveTriggered: false,
        },
        instructions: {},
        auth: { user },
      };
      store = mockStore(initialState);
      cookies = new Cookies();
    });

    describe("when user in state and local storage", () => {
      beforeEach(() => {
        render(
          <Provider store={store}>
            <CookiesProvider cookies={cookies}>
              <WebComponentLoader
                identifier={identifier}
                instructions={instructions}
                authKey={authKey}
                theme="light"
              />
            </CookiesProvider>
          </Provider>,
        );
      });

      test("Calls useProject hook with correct attributes", () => {
        expect(useProject).toHaveBeenCalledWith({
          assetsIdentifier: undefined,
          projectIdentifier: identifier,
          code: undefined,
          accessToken: "my_token",
          loadRemix: false,
          loadCache: true,
          remixLoadFailed: true,
          reactAppApiEndpoint: "http://localhost:3009",
        });
      });

      test("Does not trigger project load failed event", () => {
        expect(document.dispatchEvent).not.toHaveBeenCalledWith(
          new CustomEvent("editor-projectLoadFailed", {
            bubbles: true,
            cancelable: false,
            composed: true,
          }),
        );
      });
    });

    afterEach(async () => {
      localStorage.clear();
      await act(async () => cookies.remove("theme"));
    });
  });

  describe("when a project fails to load", () => {
    beforeEach(() => {
      localStorage.setItem(authKey, JSON.stringify(user));
      const middlewares = [];
      const mockStore = configureStore(middlewares);
      const initialState = {
        editor: {
          loading: "failed",
          project: {
            components: [],
          },
          openFiles: [],
          focussedFileIndices: [],
          hasShownSavePrompt: false,
          remixLoadFailed: false,
          justLoaded: false,
          saveTriggered: false,
        },
        instructions: {},
        auth: { user },
      };
      store = mockStore(initialState);
      cookies = new Cookies();
      render(
        <Provider store={store}>
          <CookiesProvider cookies={cookies}>
            <WebComponentLoader
              identifier={identifier}
              instructions={instructions}
              authKey={authKey}
              theme="light"
            />
          </CookiesProvider>
        </Provider>,
      );
    });

    test("triggers project load failed event", () => {
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        new CustomEvent("editor-projectLoadFailed", {
          bubbles: true,
          cancelable: false,
          composed: true,
        }),
      );
    });
  });
});
