const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers["Origin"] = origin;
    req.continue();
  });
  cy.viewport(1400, 800);
});

const getIframeBody = () => {
  return cy
    .get("editor-wc")
    .shadow()
    .findByTitle("Scratch")
    .its("0.contentDocument.body")
    .should("not.be.empty")
    .then(cy.wrap);
};

// Consider
const openSaveAndDownloadPanel = () => {
  cy.get("editor-wc").shadow().find("[title='Download project']").click();
  cy.get("editor-wc")
    .shadow()
    .find(".sidebar__panel-heading")
    .contains("Save & download")
    .should("be.visible");

  return {
    uploadProject: (fixturePath) => {
      cy.get("editor-wc")
        .shadow()
        .find("[data-testid='upload-file-input']")
        .selectFile(fixturePath, { force: true });
    },
  };
};

describe("Scratch", () => {
  beforeEach(() => {
    cy.visit(origin);
    cy.findByText("cool-scratch").click();
  });

  it("loads Scratch in an iframe", () => {
    getIframeBody().find("button [title='Go']").should("be.visible");
  });

  it("hides text size in settings for Scratch", () => {
    getIframeBody().find("button [title='Go']").should("be.visible");
    cy.get("editor-wc").shadow().find("[title='Settings']").first().click();
    cy.get("editor-wc")
      .shadow()
      .find(".settings-panel__text-size")
      .should("exist")
      .and("not.be.visible");
  });

  it("uploads project and shows upload in Scratch iframe", () => {
    getIframeBody().find("button [title='Go']").should("be.visible");

    // confirm set up is different to loaded project
    getIframeBody()
      .find("[role='button']")
      .contains("teapot")
      .should("be.visible");

    getIframeBody()
      .find("[role='button']")
      .contains("test sprite")
      .should("not.exist");

    const saveAndDownloadPanel = openSaveAndDownloadPanel();
    saveAndDownloadPanel.uploadProject(
      "cypress/fixtures/upload-test-project.sb3"
    );

    // confirm project has been uploaded
    getIframeBody()
      .find("[role='button']")
      .contains("test sprite")
      .should("be.visible");

    getIframeBody()
      .find("[role='button']")
      .contains("teapot")
      .should("not.exist");
  });
});
