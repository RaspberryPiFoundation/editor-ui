import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import PythonRunner from "./NewPythonRunner";

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
      image_list: [],
    },
  },
  auth: {},
};

const renderRunnerWithCode = ({
  code = "",
  codeRunTriggered = false,
  senseHatAlwaysEnabled = false,
}) => {
  let state = initialState;
  state.editor.project.components[0].content = code;
  state.editor.codeRunTriggered = codeRunTriggered;
  state.editor.senseHatAlwaysEnabled = senseHatAlwaysEnabled;
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <PythonRunner />
    </Provider>,
  );
};

test("Renders with Pyodide runner initially", () => {
  renderRunnerWithCode({});
  expect(
    document.querySelector(".skulptrunner--active"),
  ).not.toBeInTheDocument();
  expect(document.querySelector(".pyodiderunner--active")).toBeInTheDocument();
});

test("Uses pyodide when no skulpt-only modules are imported", () => {
  renderRunnerWithCode({ code: "import math" });
  expect(
    document.querySelector(".skulptrunner--active"),
  ).not.toBeInTheDocument();
  expect(document.querySelector(".pyodiderunner--active")).toBeInTheDocument();
});

test("Uses skulpt when skulpt-only modules are imported", () => {
  renderRunnerWithCode({ code: "import p5" });
  expect(
    document.querySelector(".pyodiderunner--active"),
  ).not.toBeInTheDocument();
  expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
});

test("Uses skulpt when senseHatAlwaysEnabled is true", () => {
  renderRunnerWithCode({ code: "import math", senseHatAlwaysEnabled: true });
  expect(
    document.querySelector(".pyodiderunner--active"),
  ).not.toBeInTheDocument();
  expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
});

test("Switches runners if the import has a from clause", () => {
  renderRunnerWithCode({ code: "from p5 import *" });
  expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
  expect(
    document.querySelector(".pyodiderunner--active"),
  ).not.toBeInTheDocument();
});

test("Switches runners if the import is indented", () => {
  renderRunnerWithCode({ code: "    import p5" });
  expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
  expect(
    document.querySelector(".pyodiderunner--active"),
  ).not.toBeInTheDocument();
});

test("Uses skulpt if the py5 magic comment is used", () => {
  renderRunnerWithCode({ code: "# input.comment.py5" });
  expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
  expect(
    document.querySelector(".pyodiderunner--active"),
  ).not.toBeInTheDocument();
});

test("Does not switch runners while the code is running", () => {
  renderRunnerWithCode({ code: "import p5", codeRunTriggered: true });
  expect(document.querySelector(".pyodiderunner--active")).toBeInTheDocument();
  expect(
    document.querySelector(".skulptrunner--active"),
  ).not.toBeInTheDocument();
});

test("Does not switch runners if the import is in a comment", () => {
  renderRunnerWithCode({ code: "# import p5" });
  expect(document.querySelector(".pyodiderunner--active")).toBeInTheDocument();
  expect(
    document.querySelector(".skulptrunner--active"),
  ).not.toBeInTheDocument();
});

test("Does not switch runners if the import is in a string", () => {
  renderRunnerWithCode({ code: 'print("import p5")' });
  expect(document.querySelector(".pyodiderunner--active")).toBeInTheDocument();
  expect(
    document.querySelector(".skulptrunner--active"),
  ).not.toBeInTheDocument();
});

test("Does not switch runners if the import is in a multiline string", () => {
  renderRunnerWithCode({ code: '"""\nimport p5\n"""' });
  expect(document.querySelector(".pyodiderunner--active")).toBeInTheDocument();
  expect(
    document.querySelector(".skulptrunner--active"),
  ).not.toBeInTheDocument();
});
