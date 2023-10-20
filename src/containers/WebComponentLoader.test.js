import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentLoader from "./WebComponentLoader";
import { setProject, setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
import { setInstructions } from "../redux/InstructionsSlice";

let store;
const code = "print('This project is amazing')";
const steps = [{ quiz: false, title: "Step 1", content: "Do something" }];
const instructions = { currentStepPosition: 3, project: { steps: steps } };

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

  render(
    <Provider store={store}>
      <WebComponentLoader
        code={code}
        senseHatAlwaysEnabled={true}
        instructions={instructions}
      />
    </Provider>,
  );
});

test("Sets project with code from attribute", () => {
  const project = {
    type: "python",
    components: [{ name: "main", extension: "py", content: code }],
  };
  expect(store.getActions()).toEqual(
    expect.arrayContaining([setProject(project)]),
  );
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
