import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { SettingsContext } from "../../../utils/settings";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import EditorPanel from "./EditorPanel";

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
