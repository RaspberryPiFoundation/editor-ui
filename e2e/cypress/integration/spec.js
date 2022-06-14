const baseUrl = "http://react-ui-test:3000"

it("renders the web component", () => {
  cy.visit(baseUrl)
  cy.get(".editor-controls button").should("contain", "Run Code")
})


