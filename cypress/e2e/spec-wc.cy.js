const baseUrl = "http://localhost:3001";

describe("default behaviour", () => {
  beforeEach(() => {
    cy.visit(baseUrl);
  });

  it("renders the web component", () => {
    cy.get("editor-wc").shadow().find("button").should("contain", "Run");
  });

  it("defaults to the text output tab", () => {
    const runnerContainer = cy
      .get("editor-wc")
      .shadow()
      .find(".proj-runner-container");
    runnerContainer
      .find(".react-tabs__tab--selected")
      .should("contain", "Text output");
  });

  it("runs the python code", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", 'print("Hello world")');
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "Hello world");
  });

  it("runs p5 code", () => {
    const code = `from p5 import *\n\ndef setup():\n    size(400, 400)  # width and height of screen\n\ndef draw():\n    fill('cyan')  # Set the fill color for the sky to cyan\n    rect(0, 0, 400, 250)  # Draw a rectangle for the sky with these values for x, y, width, height    \n  \nrun(frame_rate=2)\n`;
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", code);
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().find(".p5Canvas").should("exist");
  });

  it("does not render visual output tab on page load", () => {
    cy.get("editor-wc")
      .shadow()
      .find("#root")
      .should("not.contain", "Visual output");
  });

  it("renders visual output tab if sense hat imported", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import sense_hat");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().find("#root").should("contain", "Visual output");
  });

  it("does not render astro pi component on page load", () => {
    cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw");
  });

  it("renders astro pi component if sense hat imported", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import sense_hat");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().contains("Visual output").click();
    cy.get("editor-wc").shadow().find("#root").should("contain", "yaw");
  });

  it("does not render astro pi component if sense hat unimported", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import sense_hat");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke("text", "");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().contains("Visual output").click();
    cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw");
  });
});
