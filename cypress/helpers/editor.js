export const getEditorShadow = () => cy.get("editor-wc").shadow();

export const openSaveAndDownloadPanel = () => {
  getEditorShadow().findByRole("button", { name: "Download project" }).click();
  getEditorShadow()
    .findByRole("heading", { name: "Save & download" })
    .should("be.visible");

  return {
    uploadProject: (fixturePath) => {
      getEditorShadow()
        .findByTestId("upload-file-input")
        .selectFile(fixturePath, { force: true });
    },
    downloadProject: () => {
      getEditorShadow()
        .find(".download-panel__download-section")
        .findByRole("button", { name: "Download project" })
        .click();
    },
  };
};
