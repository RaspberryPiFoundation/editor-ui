export const getEditorShadow = () => cy.get("editor-wc").shadow();

export const getPythonConsoleOutput = () =>
  getEditorShadow().find(".pythonrunner-console-output-line");

export const getPyodideOutput = () => getEditorShadow().find(".pyodiderunner");

export const getErrorMessage = () =>
  getEditorShadow().find(".error-message__content");

export const getSidebarPanel = () =>
  getEditorShadow().findByTestId("sidebar__panel");

export const openSaveAndDownloadPanel = () => {
  getEditorShadow().findByRole("button", { name: "Download project" }).click();

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

export const getCodeEditorContent = () =>
  getEditorShadow().find("div.cm-content");

export const setCodeEditorContent = (content) =>
  getCodeEditorContent().invoke("text", content);

export const runProject = () =>
  getEditorShadow().findByRole("button", { name: /run/i }).click();

export const getHtmlRunnerContainer = () =>
  getEditorShadow().findByTestId("html-runner-container");

export const getHtmlRunnerIframe = () =>
  getEditorShadow().findByTestId("html-runner-iframe");

export const getHtmlRunnerDocument = () =>
  getHtmlRunnerIframe().its("0.contentDocument").should("exist");

export const getHtmlRunnerBody = () =>
  getHtmlRunnerDocument().its("body").should("not.be.null").then(cy.wrap);

export const expectHtmlRunnerPreviewToContainText = (text) =>
  getHtmlRunnerBody().should("contain.text", text);

export const expectHtmlRunnerPreviewToNotContainText = (text) =>
  getHtmlRunnerBody().should("not.contain.text", text);

export const clickHtmlRunnerPreviewLink = (name) =>
  getHtmlRunnerBody().then((body) => {
    cy.wrap(body).findByRole("link", { name }).click();
  });

export const clickAddFileButton = () =>
  getEditorShadow().findByRole("button", { name: "Add file" }).click();

export const getAddFileNameInput = () =>
  getEditorShadow().findByRole("textbox");

export const confirmAddFile = () =>
  getEditorShadow()
    .findAllByRole("button", { name: "Add file" })
    .last()
    .click();

export const makeNewFile = (filename = "new.html") => {
  clickAddFileButton();
  getAddFileNameInput().clear().type(filename);
  confirmAddFile();
};

export const getErrorModalTitle = () =>
  getEditorShadow().findByRole("heading", { name: "An error has occurred" });

export const expectErrorModalToNotExist = () =>
  getEditorShadow().contains("An error has occurred").should("not.exist");
