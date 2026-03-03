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

describe("Scratch", () => {
  beforeEach(() => {
    cy.visit(origin);
    cy.findByText("blank-scratch").click();
  });

  it("loads Scratch in an iframe", () => {
    getIframeBody().find("button [title='Go']").should("be.visible");
  });

  it("shows text size in standard editor settings and hides it for scratch", () => {
    const getEditorShadow = () => cy.get("editor-wc").shadow();

    const openSettingsPanel = () => {
      getEditorShadow().find(".sidebar").should("exist");
      getEditorShadow().find("[title='Settings']").first().click();
      getEditorShadow().find(".settings-panel").should("exist");
    };

    cy.findByText("blank-python-starter").click();

    openSettingsPanel();
    getEditorShadow().find(".settings-panel__text-size").should("be.visible");

    cy.findByText("blank-scratch").click();
    getIframeBody().find("button [title='Go']").should("be.visible");

    openSettingsPanel();
    getEditorShadow()
      .find(".settings-panel__text-size")
      .should("exist")
      .and("not.be.visible");
  });
});
