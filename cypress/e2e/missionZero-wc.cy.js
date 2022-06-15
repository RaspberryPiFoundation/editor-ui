const baseUrl = "http://localhost:9000"
before(() => {
  cy.visit(baseUrl)
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import _internal_sense_hat')
  cy.get("editor-wc").shadow().find(".btn--run").click()
})

it("loads the sense hat library", () => {
  cy.get("#results").should("contain", '"isErrorFree":true')
})

it("sets initial criteria correctly", () => {
  cy.get("#results").should("contain", '"noInputEvents":true,"readHumidity":false,"readPressure":false,"readTemperature":false,"usedLEDs":false')
})

it("checks temperature has been read correctly", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import _internal_sense_hat as _ish\n_ish.temperatureRead()')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("#results").should("contain", '"readTemperature":true')
})

it("checks humidity has been read correctly", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import _internal_sense_hat as _ish\n_ish.humidityRead()')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("#results").should("contain", '"readHumidity":true')
})

it("checks pressure has been read correctly", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import _internal_sense_hat as _ish\n_ish.pressureRead()')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("#results").should("contain", '"readPressure":true')
})

it("resets criteria correctly", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import _internal_sense_hat as _ish\n_ish.pressureRead()\n_ish.humidityRead()\n_ish.temperatureRead()')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', '')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("#results").should("contain", '"noInputEvents":true,"readHumidity":false,"readPressure":false,"readTemperature":false,"usedLEDs":false')
})

it("confirms LEDs used when single led set", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import _internal_sense_hat as _ish\n_ish.setpixel(0, [100,100,100])')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("#results").should("contain", '"usedLEDs":true')
})

it("confirms LEDs used when display set", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import _internal_sense_hat as _ish\n_ish.setpixels([0], [[100,100,100]])')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("#results").should("contain", '"usedLEDs":true')
})

// it("picks up calls to input()", () => {
//   cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'input()')
//   cy.get("editor-wc").shadow().find(".btn--run").click()
//   cy.get("#results").should("contain", '"noInputEvents":false')
// })

it("picks up calls to wait for motion", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'import _internal_sense_hat as _ish\n_ish._waitmotion()')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("#results").should("contain", '"noInputEvents":false')
})

it("picks up errors from the editor", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke('text', 'zkgjdlzjgl')
  cy.get("editor-wc").shadow().find(".btn--run").click()
  cy.get("#results").should("contain", '"isErrorFree":false')
})
