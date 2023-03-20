const baseUrl = "http://localhost:3000"

it("renders the web component", () => {
  cy.visit(baseUrl)
  cy.get(".proj-container button").should("contain", "Run")
})

it("Interrupts py5 draws when stop button clicked", () => {
  cy.visit(baseUrl)
  cy.get("div[class=cm-content]").invoke('text', "import py5\ndef setup():\n\tsize(400, 400)\ndef draw():\n\tbackground(255)\nrun()")
  cy.get(".btn--run").click()
  
  cy.get(".btn--stop").click()
  cy.get(".error-message__content").should("contain", "Execution interrupted")

})

it("runs with the magic comment present", () => {
  cy.visit(baseUrl)
  cy.get("div[class=cm-content]").invoke('text', '# Py5: imported mode\nprint("hello world")\n')
  cy.get(".btn--run").click()

  cy.get(".pythonrunner-console-output-line").should("contain", "hello world")
})

it("Py5 imported mode runs without run_sketch()", () => {
  cy.visit(baseUrl)
  cy.get("div[class=cm-content]").invoke('text', '# Py5: imported mode\nimport py5\ndef draw():py5.rect(40,40,40)\n')
  cy.get(".btn--run").click()

  cy.get(".p5Canvas").should('be.visible')
})
