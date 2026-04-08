// Root

export const getEditorShadow = () => cy.get("editor-wc").shadow();

export const getSidebarPanel = () =>
  getEditorShadow().findByTestId("sidebar__panel");

// Buttons / controls

export const getRunButton = () =>
  getEditorShadow().findByRole("button", { name: /run/i });

export const getStopButton = () =>
  getEditorShadow().findByRole("button", { name: /stop/i });

export const getDownloadProjectButton = () =>
  getEditorShadow().findByRole("button", { name: "Download project" });

export const getAddFileButton = () =>
  getEditorShadow().findByRole("button", { name: "Add file" });

export const getConfirmAddFileButton = () =>
  getEditorShadow().findAllByRole("button", { name: "Add file" }).last();

export const getAddFileNameInput = () =>
  getEditorShadow().findByRole("textbox");

export const getFileButtonByName = (filename) =>
  getEditorShadow().findByRole("button", { name: filename });

export const getProgramInput = () => getEditorShadow().find("#input");

// Editor / output queries

export const getCodeEditorContent = () =>
  getEditorShadow().find("div.cm-content");

export const getPythonConsoleOutput = () =>
  getEditorShadow().find(".pythonrunner-console-output-line");

export const getPyodideOutput = () =>
  getEditorShadow().findByTestId("pyodide-runner");

export const getSkulptRunner = () =>
  getEditorShadow().findByTestId("skulpt-runner");

export const getP5Canvas = () => getEditorShadow().find(".p5Canvas");

export const getTurtleOutput = () => getEditorShadow().find("#turtleOutput");

export const getErrorMessage = () =>
  getEditorShadow().find(".error-message__content");

export const getTextOutputTab = () =>
  getPyodideOutput().findByLabelText("Text output");

export const getVisualOutputTab = () =>
  getPyodideOutput().contains(".react-tabs__tab", "Visual output");

export const getSkulptSelectedTab = () =>
  getSkulptRunner().find(".react-tabs__tab--selected");

export const getSkulptTabByName = (name) => getSkulptRunner().contains(name);

// HTML runner

export const getHtmlRunnerContainer = () =>
  getEditorShadow().findByTestId("html-runner-container");

export const getHtmlRunnerIframe = () =>
  getEditorShadow().findByTestId("html-runner-iframe");

export const getHtmlRunnerDocument = () =>
  getHtmlRunnerIframe().its("0.contentDocument").should("exist");

export const getHtmlRunnerBody = () =>
  getHtmlRunnerDocument().its("body").should("not.be.null").then(cy.wrap);

// Modal queries

export const getErrorModalTitle = () =>
  getEditorShadow().findByRole("heading", { name: "An error has occurred" });

// Actions

export const setCodeEditorContent = (content) =>
  getCodeEditorContent().invoke("text", content);

export const runProject = () => getRunButton().click();

export const stopProject = () => getStopButton().click();

export const clickAddFileButton = () => getAddFileButton().click();

export const confirmAddFile = () => getConfirmAddFileButton().click();

export const clickHtmlRunnerPreviewLink = (name) =>
  getHtmlRunnerBody().then((body) => {
    cy.wrap(body).findByRole("link", { name }).click();
  });

// Assertions

export const expectHtmlRunnerPreviewToContainText = (text) =>
  getHtmlRunnerBody().should("contain.text", text);

export const expectHtmlRunnerPreviewToNotContainText = (text) =>
  getHtmlRunnerBody().should("not.contain.text", text);

export const expectErrorModalToNotExist = () =>
  getEditorShadow().contains("An error has occurred").should("not.exist");

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
