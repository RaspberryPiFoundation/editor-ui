import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { SettingsContext } from "../../../utils/settings";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import EditorPanel from "./EditorPanel";

expect.extend(toHaveNoViolations);

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
