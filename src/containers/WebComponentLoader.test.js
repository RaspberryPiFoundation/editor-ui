import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import WebComponentLoader from "./WebComponentLoader";
import { setProject, setSenseHatAlwaysEnabled } from "../redux/EditorSlice";
import { setStepNumber, setSteps } from "../redux/InstructionsSlice";

let store;
const code = "print('This project is amazing')";
const steps = [{ quiz: false, title: "Step 1", content: "Do something" }];

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
    auth: {},
  };
  store = mockStore(initialState);

  render(
    <Provider store={store}>
      <WebComponentLoader
        code={code}
        senseHatAlwaysEnabled={true}
        stepNumber={12}
        steps={steps}
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

test("Sets the step number", () => {
  expect(store.getActions()).toEqual(
    expect.arrayContaining([setStepNumber(12)]),
  );
});

test("Sets the steps", () => {
  expect(store.getActions()).toEqual(expect.arrayContaining([setSteps(steps)]));
});
