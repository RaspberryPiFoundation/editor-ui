const baseUrl = "http://localhost:3001"

beforeEach(() => {
  cy.visit(baseUrl)
})

it("renders the web component", () => {
  cy.get("editor-wc").shadow().find("button").should("contain", "Run")
})

it("defaults to the text output tab", () => {
  const runnerContainer = cy.get("editor-wc").shadow().find('.proj-runner-container')
  runnerContainer.find('.react-tabs__tab--selected').should("contain", "Text Output")
})

it("runs the python code", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'print("Hello world")')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("editor-wc").shadow().find(".pythonrunner-console-output-line").should("contain", "Hello world")
})

it("does not render visual output tab on page load", () => {
  cy.get("editor-wc").shadow().find('#root').should("not.contain", "Visual Output")
})

it("renders visual output tab if sense hat imported", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import sense_hat')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("editor-wc").shadow().find('#root').should("contain", "Visual Output")
})

it("does not render astro pi component on page load",() => {
  cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw")
})

it("renders astro pi component if sense hat imported", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import sense_hat')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("editor-wc").shadow().contains('Visual Output').click()
  cy.get("editor-wc").shadow().find("#root").should("contain", "yaw")
})

it("does not render astro pi component if sense hat unimported", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import sense_hat')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', '')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("editor-wc").shadow().contains('Visual Output').click()
  cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw")
})
