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
