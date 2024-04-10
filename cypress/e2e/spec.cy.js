const baseUrl = "http://localhost:3012/en/projects/blank-python-starter";

it("renders the web component", () => {
  cy.visit(baseUrl);
  cy.get(".proj-container editor-wc").shadow().contains("Run").should("be.visible")
});
