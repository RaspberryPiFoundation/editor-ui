const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers["Origin"] = origin;
    req.continue();
  });
});

describe("Running the code with skulpt", () => {
  beforeEach(() => {
    cy.visit(origin);
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

  it("Interrupts py5 draws when stop button clicked", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke(
        "text",
        "import py5\ndef setup():\n\tpy5.size(400, 400)\ndef draw():\n\tpy5.background(255)\npy5.run_sketch()",
      );
    cy.wait(200);
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.wait(1000);
    cy.get("editor-wc").shadow().find(".btn--stop").click();
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should("contain", "Execution interrupted");
  });

  it("Py5 magic comment imports py5", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "# Py5: imported mode");
    cy.wait(200);
    cy.get("editor-wc").shadow().find(".btn--run").click();

    cy.get("editor-wc").shadow().find(".p5Canvas").should("be.visible");
  });

  it("Py5 imported mode runs sketch without explicit run call", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke(
        "text",
        '# Py5: imported mode\ndef setup():\n\tsize(400,400)\n\ndef draw():\n\tprint("hello world")',
      );
    cy.wait(200);
    cy.get("editor-wc").shadow().find(".btn--run").click();

    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "hello world");
  });

  it("renders visual output tab if sense hat imported", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import sense_hat");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc")
      .shadow()
      .find("#root")
      .should("contain", "Visual output");
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
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import p5");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().contains("Visual output").click();
    cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw");
  });

  it("includes an explanation of import errors", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import turtle\nimport matplotlib");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should(
        "contain.text",
        "If you are using p5, py5, sense_hat or turtle, matplotlib might not work.",
      );
  });
});
