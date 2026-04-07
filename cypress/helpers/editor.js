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

export const runProject = () => getEditorShadow().find(".btn--run").click();

export const getHtmlRunnerIframe = () =>
  getEditorShadow().find("iframe.htmlrunner-iframe");

export const getIframeDocument = () =>
  getHtmlRunnerIframe().its("0.contentDocument").should("exist");

export const getIframeBody = () =>
  getIframeDocument().its("body").should("not.be.null");

export const clickAddFile = () =>
  getEditorShadow().find("span").contains("Add file").click();

export const getAddFileModalInput = () =>
  getEditorShadow().find("div.modal-content__input").find("input");

export const getAddFileModalButtons = () =>
  getEditorShadow().find("div.modal-content__buttons");

export const makeNewFile = (filename = "new.html") => {
  clickAddFile();
  getAddFileModalInput().type(filename);
  getAddFileModalButtons().contains("Add file").click();
};

export const getFilesListItems = () =>
  getEditorShadow().find(".files-list-item");

export const getHtmlRunnerContainer = () =>
  getEditorShadow().find(".htmlrunner-container");

export const getModalHeader = () =>
  getEditorShadow().find("div.modal-content__header");

export const getModalHeaderTitle = () => getModalHeader().find("h2");
