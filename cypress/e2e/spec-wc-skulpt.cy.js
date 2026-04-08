import {
  getErrorMessage,
  getP5Canvas,
  getPythonConsoleOutput,
  getSkulptRunner,
  getSkulptSelectedTab,
  getSkulptTabByName,
  getTurtleOutput,
  runCode,
  stopProject,
} from "../helpers/editor.js";

const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers.Origin = origin;
    req.continue();
  });
});

describe("Running the code with skulpt", () => {
  beforeEach(() => {
    cy.visit(origin);
    cy.window().then((win) => {
      Object.defineProperty(win, "crossOriginIsolated", {
        value: false,
        configurable: true,
      });
    });
  });

  it("runs a simple program", () => {
    runCode("print('Hello world')");

    getSkulptTabByName("Visual output").should("not.be.visible");
    getSkulptSelectedTab().should("contain", "Text output");
    getPythonConsoleOutput().should("contain", "Hello world");
  });

  it("runs a simple p5 program", () => {
    runCode(
      "from p5 import *\n\ndef setup():\n\tsize(400, 400)\ndef draw():\n\tfill('cyan')\n\trect(0, 0, 400, 250)\nrun(frame_rate=2)",
    );

    getSkulptTabByName("Text output").should("exist");
    getSkulptSelectedTab().should("contain", "Visual output");
    getP5Canvas().should("exist");
  });

  it("runs a simple py5 program", () => {
    runCode(
      "import py5\ndef setup():\n\tpy5.size(400, 400)\ndef draw():\n\tpy5.background(255)\npy5.run_sketch()",
    );

    getP5Canvas().should("exist");
  });

  it("Interrupts py5 draws when stop button clicked", () => {
    runCode(
      "import py5\ndef setup():\n\tpy5.size(400, 400)\ndef draw():\n\tpy5.background(255)\npy5.run_sketch()",
    );

    cy.wait(1000);
    stopProject();
    getErrorMessage().should("contain", "Execution interrupted");
  });

  it("Py5 magic comment imports py5", () => {
    runCode("# Py5: imported mode");

    getP5Canvas().should("be.visible");
  });

  it("Py5 imported mode runs sketch without explicit run call", () => {
    runCode(
      "# Py5: imported mode\ndef setup():\n\tsize(400,400)\n\ndef draw():\n\tprint('hello world')",
    );

    getPythonConsoleOutput().should("contain", "hello world");
  });

  it("runs a simple sense_hat program", () => {
    runCode(
      "from sense_hat import SenseHat\nsense = SenseHat()\nprint(sense.get_humidity())",
    );

    getSkulptTabByName("Text output").click();
    getSkulptRunner().should("contain.text", "45");
  });

  it("renders visual output tab if sense hat imported", () => {
    runCode("import sense_hat");

    getSkulptRunner().should("contain", "Visual output");
  });

  it("does not render astro pi component on page load", () => {
    getSkulptRunner().should("not.contain", "yaw");
  });

  it("renders astro pi component if sense hat imported", () => {
    runCode("import sense_hat");

    getSkulptTabByName("Visual output").click();
    getSkulptRunner().should("contain", "yaw");
  });

  it("does not render astro pi component if sense hat unimported", () => {
    runCode("import sense_hat");
    runCode("import p5");

    getSkulptTabByName("Visual output").click();
    getSkulptRunner().should("not.contain", "yaw");
  });

  it("runs a simple turtle program", () => {
    runCode(
      "import turtle\nskk = turtle.Turtle()\nfor i in range(4):\n\tskk.forward(50)\n\tskk.left(90)\nturtle.done()",
    );

    getTurtleOutput().should("exist");
  });

  it("includes an explanation of import errors if cross-origin isolated", () => {
    cy.window().then((win) => {
      Object.defineProperty(win, "crossOriginIsolated", {
        value: true,
        configurable: true,
      });
    });

    runCode("import turtle\nimport matplotlib");

    getErrorMessage().should(
      "contain.text",
      "ImportError: No module named matplotlib on line 2 of main.py. You should check your code for typos. If you are using p5, py5, sense_hat or turtle, matplotlib might not work - read this article for more information.",
    );
  });
});
