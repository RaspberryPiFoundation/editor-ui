const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers["Origin"] = origin;
    req.continue();
  });
});

const runCode = (code) => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", code);
  cy.wait(200);
  cy.get("editor-wc").shadow().find(".btn--run").click();
};

describe("Running the code with skulpt", () => {
  beforeEach(() => {
    cy.visit(origin);
  });

  it("runs a simple p5 program", () => {
    runCode(
      "from p5 import *\n\ndef setup():\n\tsize(400, 400)\ndef draw():\n\tfill('cyan')\n\trect(0, 0, 400, 250)\nrun(frame_rate=2)",
    );
    cy.get("editor-wc").shadow().find(".p5Canvas").should("exist");
  });

  it("runs a simple py5 program", () => {
    runCode(
      "import py5\ndef setup():\n\tpy5.size(400, 400)\ndef draw():\n\tpy5.background(255)\npy5.run_sketch()",
    );
    cy.get("editor-wc").shadow().find(".p5Canvas").should("exist");
  });

  it("Interrupts py5 draws when stop button clicked", () => {
    runCode(
      "import py5\ndef setup():\n\tpy5.size(400, 400)\ndef draw():\n\tpy5.background(255)\npy5.run_sketch()",
    );
    cy.wait(1000);
    cy.get("editor-wc").shadow().find(".btn--stop").click();
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should("contain", "Execution interrupted");
  });

  it("Py5 magic comment imports py5", () => {
    runCode("# Py5: imported mode");
    cy.get("editor-wc").shadow().find(".p5Canvas").should("be.visible");
  });

  it("Py5 imported mode runs sketch without explicit run call", () => {
    runCode(
      "# Py5: imported mode\ndef setup():\n\tsize(400,400)\n\ndef draw():\n\tprint('hello world')",
    );
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "hello world");
  });

  it("runs a simple sense_hat program", () => {
    runCode(
      "from sense_hat import SenseHat\nsense = SenseHat()\nprint(sense.get_humidity())",
    );
    cy.get("editor-wc")
      .shadow()
      .find(".skulptrunner")
      .contains("Text output")
      .click();

    cy.get("editor-wc")
      .shadow()
      .find(".skulptrunner")
      .should("contain.text", "45");
  });

  it("renders visual output tab if sense hat imported", () => {
    runCode("import sense_hat");
    cy.get("editor-wc")
      .shadow()
      .find("#root")
      .should("contain", "Visual output");
  });

  it("does not render astro pi component on page load", () => {
    cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw");
  });

  it("renders astro pi component if sense hat imported", () => {
    runCode("import sense_hat");
    cy.get("editor-wc").shadow().contains("Visual output").click();
    cy.get("editor-wc").shadow().find("#root").should("contain", "yaw");
  });

  it("does not render astro pi component if sense hat unimported", () => {
    runCode("import sense_hat");
    runCode("import p5");
    cy.get("editor-wc").shadow().contains("Visual output").click();
    cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw");
  });

  it("runs a simple turtle program", () => {
    runCode(
      "import turtle\nskk = turtle.Turtle()\nfor i in range(4):\n\tskk.forward(50)\n\tskk.left(90)\nturtle.done()",
    );
    cy.get("editor-wc")
      .shadow()
      .find(".skulptrunner")
      .find("#turtleOutput")
      .should("exist");
  });

  it("includes an explanation of import errors", () => {
    runCode("import turtle\nimport matplotlib\n");
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should(
        "contain.text",
        "If you are using p5, py5, sense_hat or turtle, matplotlib might not work.",
      );
  });
});