import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentLoader from "./WebComponentLoader";
import { setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
import { setInstructions } from "../redux/InstructionsSlice";
import { useProject } from "../hooks/useProject";

jest.mock("../hooks/useProject", () => ({
  useProject: jest.fn(),
}));

let store;
const code = "print('This project is amazing')";
const identifier = "My amazing project";
const steps = [{ quiz: false, title: "Step 1", content: "Do something" }];
const instructions = { currentStepPosition: 3, project: { steps: steps } };
const authKey = "my_key";

beforeEach(() => {
  localStorage.setItem(authKey, JSON.stringify({ access_token: "my_token" }));
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

test("Calls useProject hook with correct attribute", () => {
  expect(useProject).toHaveBeenCalledWith({
    projectIdentifier: identifier,
    code,
    accessToken: "my_token",
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
