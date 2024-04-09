import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import PythonRunner from "./PythonRunner";

// describe("When in tabbed view", () => {
let store;

// beforeEach(() => {
const middlewares = [];
const mockStore = configureStore(middlewares);
const initialState = {
  editor: {
    project: {
      components: [
        {
          name: "main",
          extension: "py",
          content: "",
        },
      ],
    },
  },
  auth: {},
};

const renderRunnerWithCode = (code = "") => {
  let state = initialState;
  state.editor.project.components[0].content = code;
  store = mockStore(state);
  render(
    <Provider store={store}>
      <PythonRunner />
    </Provider>,
  );
};

test("Renders with Pyodide runner initially", () => {
  renderRunnerWithCode();
  expect(document.querySelector(".pyodiderunner")).toHaveStyle("display: flex");
  expect(document.querySelector(".skulptrunner")).toHaveStyle("display: none");
});

test("Pyodide is used when no Skulpt-only modules are imported", () => {
  renderRunnerWithCode("import p5");
  expect(document.querySelector(".pyodiderunner")).toHaveStyle("display: flex");
});
