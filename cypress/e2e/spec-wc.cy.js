const baseUrl = "http://localhost:9000"

before(() => {
  cy.visit(baseUrl)
})

it("renders the web component", () => {
  cy.get("editor-wc").shadow().find("button").should("contain", "Run Code")
})

it("runs the python code", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").type("\nprint('Hello world')")
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("editor-wc").shadow().find(".pythonrunner-console-output-line").should("contain", "Hello world")
})
