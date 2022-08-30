const baseUrl = "http://localhost:3001"

beforeEach(() => {
  cy.visit(baseUrl)
})

it("renders the web component", () => {
  cy.get("editor-wc").shadow().find("button").should("contain", "Run")
})

it("runs the python code", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'print("Hello world")')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("editor-wc").shadow().find(".pythonrunner-console-output-line").should("contain", "Hello world")
})
