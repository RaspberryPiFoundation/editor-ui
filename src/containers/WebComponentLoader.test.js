import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentLoader from "./WebComponentLoader";
import { setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
import { setInstructions } from "../redux/InstructionsSlice";
import { useProject } from "../hooks/useProject";
import { useProjectPersistence } from "../hooks/useProjectPersistence";

jest.mock("../hooks/useProject", () => ({
  useProject: jest.fn(),
}));

jest.mock("../hooks/useProjectPersistence", () => ({
  useProjectPersistence: jest.fn(),
}));

let store;
const code = "print('This project is amazing')";
const identifier = "My amazing project";
const steps = [{ quiz: false, title: "Step 1", content: "Do something" }];
const instructions = { currentStepPosition: 3, project: { steps: steps } };
const authKey = "my_key";
const user = { access_token: "my_token" };

beforeEach(() => {
  localStorage.setItem(authKey, JSON.stringify(user));
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

  render(
    <Provider store={store}>
      <WebComponentLoader
        code={code}
        identifier={identifier}
        senseHatAlwaysEnabled={true}
        instructions={instructions}
        authKey={authKey}
      />
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

afterEach(() => {
  localStorage.clear();
});
