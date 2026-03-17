export const getEditorShadow = () => cy.get("editor-wc").shadow();

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
