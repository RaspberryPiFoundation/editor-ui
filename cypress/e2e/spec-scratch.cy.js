import {
  getEditorShadow,
  openSaveAndDownloadPanel,
} from "../helpers/editor.js";
import { getScratchIframeBody } from "../helpers/scratch.js";

const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers["Origin"] = origin;
    req.continue();
  });
  cy.viewport(1400, 800);
});

describe("Scratch", () => {
  beforeEach(() => {
    cy.visit(origin);
    cy.findByText("cool-scratch").click();
  });

  it("loads Scratch in an iframe", () => {
    getScratchIframeBody().findByTitle("Go").should("be.visible");
  });

  it("hides text size in settings for Scratch", () => {
    getScratchIframeBody().findByTitle("Go").should("be.visible");
    getEditorShadow()
      .findByRole("button", { name: "Settings" })
      .first()
      .click();
    getEditorShadow()
      .find(".settings-panel__text-size")
      .should("exist")
      .and("not.be.visible");
  });

  it("uploads project and shows upload in Scratch iframe", () => {
    getScratchIframeBody().findByTitle("Go").should("be.visible");

    // confirm set up is different to loaded project
    getScratchIframeBody()
      .findByRole("button", { name: "test sprite" })
      .should("not.exist");

    const saveAndDownloadPanel = openSaveAndDownloadPanel();
    saveAndDownloadPanel.uploadProject(
      "cypress/fixtures/upload-test-project.sb3",
    );

    // confirm project has been uploaded
    getScratchIframeBody()
      .findByRole("button", { name: "test sprite" })
      .should("be.visible");
  });
});
