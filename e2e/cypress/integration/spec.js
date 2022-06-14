// it("renders the page", () => {
//   cy.visit("/")
//   cy.get(".editor-controls button").should("contain", "Run Code")
// })

it("renders the web component", () => {
  cy.visit("/")
  // cy.get(".editor-controls button").should("contain", "Run Code")
  // cy.get("editor-wc").shadow().find("button").its('length').should('be.gt', 0);
  cy.get("editor-wc").shadow().find("button").should("contain", "Run Code")

})

