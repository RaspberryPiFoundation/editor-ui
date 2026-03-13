import { getEditorShadow } from "./editor.js";

export const getScratchIframeBody = () => {
  return getEditorShadow()
    .findByTitle("Scratch")
    .its("0.contentDocument.body")
    .should("not.be.empty")
    .then(cy.wrap);
};

export const getScratchGoButton = () =>
  getScratchIframeBody().find("button [title='Go']");

export const assertScratchIsRendered = () => {
  getScratchGoButton().should("be.visible");
};
