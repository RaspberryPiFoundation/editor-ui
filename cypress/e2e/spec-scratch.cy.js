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
    cy.findByText("cool-scratch").click();
  });

  it("loads Scratch in an iframe", () => {
    getIframeBody().find("button [title='Go']").should("be.visible");
  });
});
