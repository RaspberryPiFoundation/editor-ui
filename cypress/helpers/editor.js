// Root

export const getEditorShadow = () => cy.get("editor-wc").shadow();

export const getSidebarPanel = () =>
  getEditorShadow().findByTestId("sidebar__panel");

// Buttons / controls

export const getRunButton = () =>
  getEditorShadow().findByRole("button", { name: /run/i });

export const getStopButton = () =>
  getEditorShadow().findByRole("button", { name: /stop/i });

const getSaveButton = () =>
  getEditorShadow().findByRole("button", { name: "Save" });

const getDownloadProjectButton = () =>
  getEditorShadow().findByRole("button", { name: "Download project" });

const getAddFileButton = () =>
  getEditorShadow().findByRole("button", { name: "Add file" });

const getConfirmAddFileButton = () =>
  getEditorShadow().findAllByRole("button", { name: "Add file" }).last();

const getAddFileNameInput = () =>
  getEditorShadow().findByRole("textbox", { name: "Name your file" });

export const getFileButtonByName = (filename) =>
  getEditorShadow().findByRole("button", { name: filename });

const getSettingsButton = () =>
  getEditorShadow().find("[title='Settings']").first();

export const getProgramInput = () =>
  getEditorShadow().findByRole("textbox", { name: "Text input" });

// Editor / output queries

const getCodeEditorContent = () => getEditorShadow().find("div.cm-content");

export const getCodeEditorInput = () =>
  getEditorShadow().find("[contenteditable]");

export const getPythonConsoleOutput = () =>
  getEditorShadow().find(".pythonrunner-console-output-line");

export const getPyodideOutput = () =>
  getEditorShadow().findByTestId("pyodide-runner");

export const getSkulptRunner = () =>
  getEditorShadow().findByTestId("skulpt-runner");

export const getP5Canvas = () => getEditorShadow().find(".p5Canvas");

export const getTurtleOutput = () => getEditorShadow().find("#turtleOutput");

export const getErrorMessage = () =>
  getEditorShadow().find(".error-message__python");

export const getFriendlyErrorMessage = () =>
  getEditorShadow().find(".friendly-error-message");

export const getTextOutputTab = () =>
  getPyodideOutput().findByLabelText("Text output");

export const getSkulptTabByName = (name) =>
  getSkulptRunner().findByRole("tab", { name });

// Layout / panels

export const getSidebar = () => getEditorShadow().find(".sidebar");

export const getSettingsPanel = () => getEditorShadow().find(".settings-panel");

export const getTextSizeSetting = () =>
  getEditorShadow().find(".settings-panel__text-size");

export const getProjEditorContainer = () =>
  getEditorShadow().findByTestId("proj-editor-container");

export const getEditorResizeHandle = (handleTestId) =>
  getProjEditorContainer().findByTestId(handleTestId).parent("div");

export const getSidebarResizeHandle = () =>
  getSidebarPanel().findByTestId("verticalHandle").parent("div");

const dragHandle = ($handle, { deltaX = 0, deltaY = 0 }) => {
  cy.wrap($handle)
    .realMouseDown({
      button: "left",
      position: "center",
      scrollBehavior: false,
    })
    .realMouseMove(deltaX, deltaY, {
      position: "center",
      scrollBehavior: false,
    })
    .realMouseUp({ position: "center", scrollBehavior: false });
};

export const dragEditorResizeHandle = (
  handleTestId,
  { deltaX = 0, deltaY = 0 } = {},
) => {
  getEditorResizeHandle(handleTestId).then(($handle) => {
    dragHandle($handle, { deltaX, deltaY });
  });
};

export const dragSidebarResizeHandle = ({ deltaX = 80 } = {}) => {
  getSidebarResizeHandle().then(($handle) => {
    dragHandle($handle, { deltaX, deltaY: 0 });
  });
};

export const openFilePanel = () =>
  getEditorShadow().find("[title='Project files']").click();

export const loadPythonStarterProject = () => {
  cy.findByText("blank-python-starter").click();
  getEditorShadow().findByRole("button", { name: /run/i }).should("be.visible");
};

// Test output

export const getResults = () => cy.get("#results");

// Actions

export const setCodeEditorContent = (content) =>
  getCodeEditorContent().invoke("text", content);

export const runProject = () => getRunButton().click();

export const stopProject = () => getStopButton().click();

export const saveProject = () => getSaveButton().click();

const clickAddFileButton = () => getAddFileButton().click();

const confirmAddFile = () => getConfirmAddFileButton().click();

export const openSettingsPanel = () => getSettingsButton().click();

// Flows

export const makeNewFile = (filename = "new.html") => {
  clickAddFileButton();
  getAddFileNameInput().clear().type(filename);
  confirmAddFile();
};

export const runCode = (code) => {
  // Add extra newline to ensure any tooltips are dismissed
  setCodeEditorContent(`${code}\n`);
  getRunButton().should("not.be.disabled");
  runProject();
};

export const openSaveAndDownloadPanel = () => {
  getDownloadProjectButton().click();

  getSidebarPanel()
    .findByRole("heading", { name: "Save & download" })
    .should("be.visible");

  return {
    uploadProject: (fixturePath) => {
      getSidebarPanel().within(() => {
        cy.findByRole("button", { name: "Upload project" }).should(
          "be.visible",
        );
        cy.findByTestId("upload-file-input").selectFile(fixturePath, {
          force: true,
        });
      });
    },
    downloadProject: () => {
      getSidebarPanel()
        .findByRole("button", { name: "Download project" })
        .click();
    },
  };
};
