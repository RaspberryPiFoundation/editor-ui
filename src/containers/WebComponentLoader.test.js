import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentLoader from "./WebComponentLoader";
import { disableTheming, setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
import { setInstructions } from "../redux/InstructionsSlice";
import { useProject } from "../hooks/useProject";
import { useProjectPersistence } from "../hooks/useProjectPersistence";
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
const instructions = { currentStepPosition: 3, project: { steps: steps } };
const user = { access_token: "my_token" };

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      loading: "success",
      project: {
        components: [],
      },
      openFiles: [],
      focussedFileIndices: [],
    },
    instructions: {},
    auth: {},
  };
  store = mockStore(initialState);
  cookies = new Cookies();
});

describe("When props are set", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <CookiesProvider cookies={cookies}>
          <WebComponentLoader
            code={code}
            identifier={identifier}
            senseHatAlwaysEnabled={true}
            instructions={instructions}
            user={user}
            theme="light"
          />
        </CookiesProvider>
      </Provider>,
    );
  });

  test("Calls useProject hook with correct attributes", () => {
    expect(useProject).toHaveBeenCalledWith({
      projectIdentifier: identifier,
      code,
      accessToken: "my_token",
    });
  });

  test("Calls useProjectPersistence hook with correct attributes", () => {
    expect(useProjectPersistence).toHaveBeenCalledWith({
      user,
      project: { components: [] },
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

  test("Disables theming", () => {
    expect(store.getActions()).toEqual(
      expect.arrayContaining([disableTheming()]),
    );
  });

  test("Sets theme correctly", () => {
    expect(cookies.cookies.theme).toEqual("light");
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

afterEach(() => {
  localStorage.clear();
  cookies.remove("theme");
});
