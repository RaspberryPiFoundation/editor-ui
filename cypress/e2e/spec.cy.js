const baseUrl = "http://localhost:3000"

it("renders the web component", () => {
  cy.visit(baseUrl)
  cy.get(".proj-container button").should("contain", "Run")
})


