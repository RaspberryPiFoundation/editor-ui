import { expect } from "@playwright/test";

// Playwright port of the parts of cypress/helpers/editor.js used by spec-wc and spec-wc-pyodide. Playwright's CSS and role locators pierce open shadow roots, so there is no `.shadow()` step: scoping to `editor-wc` is enough.

export const getEditorShadow = (page) => page.locator("editor-wc");

// Buttons / controls

export const getRunButton = (page) =>
  getEditorShadow(page).getByRole("button", { name: /run/i });

export const getStopButton = (page) =>
  getEditorShadow(page).getByRole("button", { name: /stop/i });

const getSaveButton = (page) =>
  getEditorShadow(page).getByRole("button", { name: "Save", exact: true });

const getSettingsButton = (page) =>
  getEditorShadow(page).locator("[title='Settings']").first();

const getFilePanelButton = (page) =>
  getEditorShadow(page).locator("[title='Project files']").first();

const getAddFileButton = (page) =>
  getEditorShadow(page).getByRole("button", { name: "Add file", exact: true });

export const getFileButtonByName = (page, filename) =>
  getEditorShadow(page).getByRole("button", { name: filename, exact: true });

export const getProgramInput = (page) =>
  getEditorShadow(page).getByRole("textbox", {
    name: "Text input",
    exact: true,
  });

// Editor / output queries

export const getCodeEditorInput = (page) =>
  getEditorShadow(page).locator("[contenteditable]");

const getCodeEditorContent = (page) =>
  getEditorShadow(page).locator("div.cm-content");

export const getPythonConsoleOutput = (page) =>
  getEditorShadow(page).locator(".pythonrunner-console-output-line");

export const getPyodideOutput = (page) =>
  getEditorShadow(page).getByTestId("pyodide-runner");

// The Pyodide runner is always in the DOM next to the Skulpt runner; only the active one has this class. Asserting it guards against tests silently passing on Skulpt.
export const getActivePyodideRunner = (page) =>
  getEditorShadow(page).locator(".pyodiderunner--active");

export const getErrorLine = (page) =>
  getEditorShadow(page).locator(".cm-error-line");

export const getTextOutputTab = (page) =>
  getPyodideOutput(page).getByLabel("Text output", { exact: true });

export const getSkulptRunner = (page) =>
  getEditorShadow(page).getByTestId("skulpt-runner");

export const getSkulptTabByName = (page, name) =>
  getSkulptRunner(page).getByRole("tab", { name, exact: true });

// Layout / panels

export const getSidebar = (page) => getEditorShadow(page).locator(".sidebar");

export const getSettingsPanel = (page) =>
  getEditorShadow(page).locator(".settings-panel");

export const getTextSizeSetting = (page) =>
  getEditorShadow(page).locator(".settings-panel__text-size");

// Test output

export const getResults = (page) => page.locator("#results");

// Actions

export const runProject = (page) => getRunButton(page).click();

export const stopProject = (page) => getStopButton(page).click();

export const saveProject = (page) => getSaveButton(page).click();

export const openSettingsPanel = (page) => getSettingsButton(page).click();

// Equivalent of Cypress `invoke("text", content)` on .cm-content: CodeMirror picks up the DOM mutation and replaces the document.
export const setCodeEditorContent = (page, content) =>
  getCodeEditorContent(page).evaluate((el, text) => {
    el.textContent = text;
  }, content);

export const ensureFilePanelOpen = async (page) => {
  const button = getFilePanelButton(page);
  const classes = (await button.getAttribute("class")) || "";
  if (!classes.includes("sidebar__bar-option--selected")) {
    await button.click();
  }
};

// Flows

// While a modal is open, react-modal sets aria-hidden="true" on its appElement, which GeneralModal sets to the editor-wc host, and the modal renders inside that host's shadow root. So the modal hides itself, and Playwright's role queries (which follow the flat tree, as a screen reader does) skip it. Testing Library in Cypress never sees the host's attribute because it queries from inside the shadow root. Hence getByLabel and `includeHidden` for the modal controls.
// Worse, the host keeps aria-hidden="true" after the new-file modal closes, so the whole editor stays hidden from assistive tech and every later getByRole in the test fails. That is an app accessibility bug, so it is reported with a soft assertion (the test fails) and aria-hidden is then removed so the rest of the test still checks what it was written for.
export const makeNewFile = async (page, filename = "new.html") => {
  await getAddFileButton(page).click();
  await getEditorShadow(page)
    .getByLabel("Name your file", { exact: true })
    .fill(filename);
  await getEditorShadow(page)
    .getByRole("button", { name: "Add file", exact: true, includeHidden: true })
    .last()
    .click();
  await expect(getEditorShadow(page).locator(".modal-content")).toHaveCount(0);
  await expect
    .soft(
      getEditorShadow(page),
      "editor-wc is still aria-hidden after the new-file modal closed",
    )
    // Short timeout: react-modal clears aria-hidden synchronously on close when it works, and the modal is already gone.
    .not.toHaveAttribute("aria-hidden", "true", { timeout: 2_000 });
  await getEditorShadow(page).evaluate((el) =>
    el.removeAttribute("aria-hidden"),
  );
};

export const runCode = async (page, code) => {
  // Add extra newline to ensure any tooltips are dismissed
  await setCodeEditorContent(page, `${code}\n`);
  await expect(getRunButton(page)).toBeEnabled();
  await runProject(page);
};
