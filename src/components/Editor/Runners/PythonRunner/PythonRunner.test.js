import { render, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { act } from "react-dom/test-utils";
import PythonRunner from "./PythonRunner";
import {
  triggerCodeRun,
  setProject,
  setSenseHatAlwaysEnabled,
} from "../../../../redux/EditorSlice";
import store from "../../../../app/store";

const initialState = {
  editor: {
    project: {
      name: "Blank project",
      project_type: "python",
      components: [
        {
          name: "main",
          extension: "py",
          content: "",
        },
        {
          name: "amazing",
          extension: "py",
          content: "",
        },
      ],
      images: [],
    },
  },
  auth: {},
};

const updateRunner = ({
  code = "",
  codeRunTriggered = false,
  senseHatAlwaysEnabled = false,
}) => {
  act(() => {
    store.dispatch(
      setProject({
        ...initialState.editor.project,
        components: [
          {
            ...initialState.editor.project.components[0],
            content: code,
          },
          ...initialState.editor.project.components.slice(1),
        ],
      }),
    );
    if (codeRunTriggered) {
      store.dispatch(triggerCodeRun());
    }
    store.dispatch(setSenseHatAlwaysEnabled(senseHatAlwaysEnabled));
  });
};
describe("PythonRunner with default props", () => {
  beforeEach(() => {
    window.crossOriginIsolated = true;
    render(
      <Provider store={store}>
        <PythonRunner />
      </Provider>,
    );
    updateRunner({ code: "print('some loaded code')" });
  });

  test("Renders with Pyodide runner initially", () => {
    updateRunner({});
    expect(
      document.querySelector(".skulptrunner--active"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).toBeInTheDocument();
  });

  test("Uses pyodide when no skulpt-only modules are imported", () => {
    updateRunner({ code: "import math" });
    expect(
      document.querySelector(".skulptrunner--active"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).toBeInTheDocument();
  });

  test("Uses skulpt when skulpt-only modules are imported", () => {
    updateRunner({ code: "import p5" });
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).not.toBeInTheDocument();
    expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
  });

  test("Uses skulpt when senseHatAlwaysEnabled is true", () => {
    updateRunner({ code: "import math", senseHatAlwaysEnabled: true });
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).not.toBeInTheDocument();
    expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
  });

  test("Uses skulpt if not cross origin isolated", () => {
    window.crossOriginIsolated = false;
    updateRunner({ code: "import math" });
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).not.toBeInTheDocument();
    expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
  });

  test("Switches runners if the import has a from clause", () => {
    updateRunner({ code: "from p5 import *" });
    expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).not.toBeInTheDocument();
  });

  test("Switches runners if the import is indented", () => {
    updateRunner({ code: "    import p5" });
    expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).not.toBeInTheDocument();
  });

  test("Uses skulpt if the py5 magic comment is used", () => {
    updateRunner({ code: "# input.comment.py5" });
    expect(document.querySelector(".skulptrunner--active")).toBeInTheDocument();
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).not.toBeInTheDocument();
  });

  test("Does not switch runners while the code is running", () => {
    updateRunner({ code: "import p5", codeRunTriggered: true });
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).toBeInTheDocument();
    expect(
      document.querySelector(".skulptrunner--active"),
    ).not.toBeInTheDocument();
  });

  test("Does not switch runners if the import is in a comment", () => {
    updateRunner({ code: "# import p5" });
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).toBeInTheDocument();
    expect(
      document.querySelector(".skulptrunner--active"),
    ).not.toBeInTheDocument();
  });

  test("Does not switch runners if the import is in a string", () => {
    updateRunner({ code: 'print("import p5")' });
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).toBeInTheDocument();
    expect(
      document.querySelector(".skulptrunner--active"),
    ).not.toBeInTheDocument();
  });

  test("Does not switch runners if the import is in a multiline string", () => {
    updateRunner({ code: '"""\nimport p5\n"""' });
    expect(
      document.querySelector(".pyodiderunner--active"),
    ).toBeInTheDocument();
    expect(
      document.querySelector(".skulptrunner--active"),
    ).not.toBeInTheDocument();
  });

  test("Renders the text output in the skulpt runner", () => {
    updateRunner({ code: "import p5" });
    const skulptRunner = document.querySelector(".skulptrunner");
    expect(
      within(skulptRunner).queryByText("output.textOutput"),
    ).toBeInTheDocument();
  });
});

describe("PythonRunner with output panels set to visual only", () => {
  beforeEach(() => {
    window.crossOriginIsolated = true;
    render(
      <Provider store={store}>
        <PythonRunner outputPanels={["visual"]} />
      </Provider>,
    );
    updateRunner({ code: "print('some loaded code')" });
  });

  test("Does not render text output in the skulpt runner", () => {
    updateRunner({ code: "import p5" });
    const skulptRunner = document.querySelector(".skulptrunner");
    expect(
      within(skulptRunner).queryByText("output.textOutput"),
    ).not.toBeInTheDocument();
  });
});
