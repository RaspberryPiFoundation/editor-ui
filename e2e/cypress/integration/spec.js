it("renders the page", () => {
  cy.visit("/")
  cy.get(".editor-controls button").should("contain", "Run Code")
})
