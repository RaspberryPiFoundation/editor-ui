import configureStore from "redux-mock-store";
import { configureStore as configureRealStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Cookies, CookiesProvider } from "react-cookie";
import { SettingsContext } from "../../../utils/settings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import EditorPanel from "./EditorPanel";
import editorReducer, {
  editorInitialState,
  setErrorDetails,
} from "../../../redux/EditorSlice";

expect.extend(toHaveNoViolations);

const renderEditorPanel = ({ readOnly }) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [{ name: "main", extension: "py", content: "" }],
      },
      readOnly,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <EditorPanel fileName="main" extension="py" />
    </Provider>,
  );
};

describe("Editor accessibility", () => {
  beforeEach(() => {
    renderEditorPanel({ readOnly: false });
  });

  test("Editor is exposed as a labelled textbox", () => {
    expect(
      screen.getByRole("textbox", { name: "editorPanel.ariaLabel" }),
    ).toBeInTheDocument();
  });

  test("Editor describes how to leave with the keyboard", () => {
    const editorInputArea = screen.getByLabelText("editorPanel.ariaLabel");
    const instructionId = editorInputArea.getAttribute("aria-describedby");

    expect(document.getElementById(instructionId)).toHaveTextContent(
      "editorPanel.tabExitInstruction",
    );
  });
});

describe("When font size is set", () => {
  let editor;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [{ name: "main", extension: "py", content: "" }],
        },
      },
    };
    const store = mockStore(initialState);
    const editorContainer = render(
      <Provider store={store}>
        <SettingsContext.Provider
          value={{ theme: "dark", fontSize: "myFontSize" }}
        >
          <EditorPanel fileName="main" extension="py" />
        </SettingsContext.Provider>
      </Provider>,
    );
    editor = editorContainer.container.querySelector(".editor");
  });

  test("Font size class is set correctly", () => {
    expect(editor).toHaveClass("editor--myFontSize");
  });

  test("Editor panel has no AXE violations", async () => {
    const axeResults = await axe(editor);
    expect(axeResults).toHaveNoViolations();
  });

  test("Correct indentation for Python projects", () => {
    const regex = /^( {2}| {4})/gm;
    expect(regex.test("    ")).toBe(true);
  });
});

describe("When not read only", () => {
  beforeEach(() => {
    renderEditorPanel({ readOnly: false });
  });

  test("Editor is not read only", async () => {
    const editorInputArea = screen.getByLabelText("editorPanel.ariaLabel");
    expect(editorInputArea).toHaveAttribute("contenteditable", "true");
  });

  test("Pressing Escape shows the tab exit state", () => {
    const editorInputArea = screen.getByLabelText("editorPanel.ariaLabel");
    const codeMirror = editorInputArea.closest(".cm-editor");

    fireEvent.keyDown(editorInputArea, { key: "Escape", keyCode: 27 });

    expect(codeMirror).toHaveClass("cm-tab-exit-ready");
  });

  test("Typing clears the tab exit state", () => {
    const editorInputArea = screen.getByLabelText("editorPanel.ariaLabel");
    const codeMirror = editorInputArea.closest(".cm-editor");

    fireEvent.keyDown(editorInputArea, { key: "Escape", keyCode: 27 });
    fireEvent.keyDown(editorInputArea, { key: "a", keyCode: 65 });

    expect(codeMirror).not.toHaveClass("cm-tab-exit-ready");
  });

  test("Pressing a modifier keeps the tab exit state", () => {
    const editorInputArea = screen.getByLabelText("editorPanel.ariaLabel");
    const codeMirror = editorInputArea.closest(".cm-editor");

    fireEvent.keyDown(editorInputArea, { key: "Escape", keyCode: 27 });
    fireEvent.keyDown(editorInputArea, { key: "Shift", keyCode: 16 });

    expect(codeMirror).toHaveClass("cm-tab-exit-ready");
  });
});

describe("When read only", () => {
  beforeEach(() => {
    renderEditorPanel({ readOnly: true });
  });

  test("Editor is not read only", async () => {
    const editorInputArea = screen.getByLabelText("editorPanel.ariaLabel");
    expect(editorInputArea).toHaveAttribute("contenteditable", "false");
  });
});

describe("When excessive file content is pasted into the editor", () => {
  beforeEach(() => {
    renderEditorPanel({ readOnly: false });
    const editorInputArea = screen.getByLabelText("editorPanel.ariaLabel");
    const massiveFileContent = "mango".repeat(2000000);
    fireEvent.paste(editorInputArea, {
      clipboardData: {
        getData: () => massiveFileContent,
      },
    });
  });

  test("It does not display the file content", () => {
    expect(screen.queryByText(/mango/)).not.toBeInTheDocument();
  });

  test("Character limit exceeded message is displayed", () => {
    expect(
      screen.getByText("editorPanel.characterLimitError"),
    ).toBeInTheDocument();
  });

  test("It allows the user to input text below the limit", () => {
    const editorInputArea = screen.getByLabelText("editorPanel.ariaLabel");
    fireEvent.paste(editorInputArea, {
      clipboardData: {
        getData: () => "mango",
      },
    });
    expect(screen.getByText("mango")).toBeInTheDocument();
  });

  test("It removes the character limit exceeded message when the user inputs text below the limit", () => {
    const editorInputArea = screen.getByLabelText("editorPanel.ariaLabel");
    fireEvent.paste(editorInputArea, {
      clipboardData: {
        getData: () => "mango",
      },
    });
    expect(
      screen.queryByText("editorPanel.characterLimitError"),
    ).not.toBeInTheDocument();
  });
});

describe("When there is a Python error", () => {
  const mainContent = "print('one')\nx = 1 / 0\nprint('three')";
  let store;
  let container;
  let cookies;

  const renderWithErrorDetails = ({
    fileName = "main",
    extension = "py",
    errorDetails = {},
  } = {}) => {
    store = configureRealStore({
      reducer: { editor: editorReducer },
      preloadedState: {
        editor: {
          ...editorInitialState,
          project: {
            components: [
              { name: "main", extension: "py", content: mainContent },
              { name: "helper", extension: "py", content: "y = 2 / 0" },
              { name: "index", extension: "html", content: "<p>hi</p>" },
            ],
          },
          errorDetails,
        },
      },
    });
    cookies = new Cookies();
    ({ container } = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <EditorPanel fileName={fileName} extension={extension} />
        </Provider>
      </CookiesProvider>,
    ));
  };

  const setErrorLine = (line, file = "main.py") =>
    act(() => {
      store.dispatch(setErrorDetails({ type: "Error", line, file }));
    });

  const highlightedLine = () => container.querySelector(".cm-error-line");
  const highlightedLineNumber = () =>
    container.querySelector(".cm-lineNumbers .cm-error-line-gutter");

  afterEach(() => {
    cookies.remove("theme");
  });

  test("Highlights the line from a Pyodide error, which gives the line as a string", () => {
    renderWithErrorDetails();
    setErrorLine("2");

    expect(highlightedLine()).toHaveTextContent("x = 1 / 0");
    expect(highlightedLineNumber()).toHaveTextContent("2");
  });

  test("Highlights the line from a Skulpt error, which gives the line as a number", () => {
    renderWithErrorDetails();
    setErrorLine(2);

    expect(highlightedLine()).toHaveTextContent("x = 1 / 0");
    expect(highlightedLineNumber()).toHaveTextContent("2");
  });

  test("Highlights a line from an error that already exists when the editor opens", () => {
    renderWithErrorDetails({
      errorDetails: { type: "Error", line: 2, file: "main.py" },
    });

    expect(highlightedLine()).toHaveTextContent("x = 1 / 0");
  });

  test("Does not highlight anything when the error is in another file", () => {
    renderWithErrorDetails();
    setErrorLine(1, "helper.py");

    expect(highlightedLine()).not.toBeInTheDocument();
    expect(highlightedLineNumber()).not.toBeInTheDocument();
  });

  test("Highlights the line in the file the error is in", () => {
    renderWithErrorDetails({ fileName: "helper" });
    setErrorLine(1, "helper.py");

    expect(highlightedLine()).toHaveTextContent("y = 2 / 0");
  });

  test("Does not highlight anything when the line is past the end of the file", () => {
    renderWithErrorDetails();
    setErrorLine(2);
    expect(highlightedLine()).toBeInTheDocument();

    // Skulpt reports an unclosed bracket on the last line as one line past it
    setErrorLine(4);

    expect(highlightedLine()).not.toBeInTheDocument();
    expect(highlightedLineNumber()).not.toBeInTheDocument();
  });

  test("Editing the file clears the highlight", () => {
    renderWithErrorDetails();
    setErrorLine(2);
    expect(highlightedLine()).toBeInTheDocument();

    fireEvent.paste(screen.getByLabelText("editorPanel.ariaLabel"), {
      clipboardData: { getData: () => "z" },
    });

    expect(highlightedLine()).not.toBeInTheDocument();
    expect(highlightedLineNumber()).not.toBeInTheDocument();
  });

  test("Editing the file stops the highlight coming back when the editor is rebuilt", () => {
    renderWithErrorDetails();
    setErrorLine(2);

    fireEvent.paste(screen.getByLabelText("editorPanel.ariaLabel"), {
      clipboardData: { getData: () => "z" },
    });
    act(() => {
      cookies.set("theme", "dark");
    });

    expect(store.getState().editor.errorLineDismissed).toBe(true);
    expect(highlightedLine()).not.toBeInTheDocument();
  });

  test("Editing a different file does not dismiss the error", () => {
    renderWithErrorDetails({ fileName: "helper" });
    setErrorLine(2, "main.py");

    fireEvent.paste(screen.getByLabelText("editorPanel.ariaLabel"), {
      clipboardData: { getData: () => "z" },
    });

    expect(store.getState().editor.errorLineDismissed).toBe(false);
  });

  test("A new error is highlighted after the last one was dismissed", () => {
    renderWithErrorDetails();
    setErrorLine(2);
    fireEvent.paste(screen.getByLabelText("editorPanel.ariaLabel"), {
      clipboardData: { getData: () => "z" },
    });

    setErrorLine(3);

    expect(highlightedLine()).toHaveTextContent("print('three')");
  });

  test("Running the code again clears the highlight", () => {
    renderWithErrorDetails();
    setErrorLine(2);
    expect(highlightedLine()).toBeInTheDocument();

    // Both runners reset errorDetails to {} at the start of a run
    act(() => {
      store.dispatch(setErrorDetails({}));
    });

    expect(highlightedLine()).not.toBeInTheDocument();
    expect(highlightedLineNumber()).not.toBeInTheDocument();
  });

  test("A new error moves the highlight to its line", () => {
    renderWithErrorDetails();
    setErrorLine(2);
    setErrorLine(3);

    expect(container.querySelectorAll(".cm-error-line")).toHaveLength(1);
    expect(highlightedLine()).toHaveTextContent("print('three')");
    expect(highlightedLineNumber()).toHaveTextContent("3");
  });

  test("Keeps the highlight when the theme changes and the editor is rebuilt", () => {
    renderWithErrorDetails();
    setErrorLine(2);

    act(() => {
      cookies.set("theme", "dark");
    });

    expect(highlightedLine()).toHaveTextContent("x = 1 / 0");
    expect(highlightedLineNumber()).toHaveTextContent("2");
  });
});
