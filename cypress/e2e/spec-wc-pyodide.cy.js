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
  cy.get("editor-wc").shadow().find(".btn--run").click();
};

describe("Running the code with pyodide", () => {
  beforeEach(() => {
    cy.visit(origin);
  });

  it("runs a simple program", () => {
    runCode('print("Hello world")');
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "Hello world");
  });

  it("interrupts the code when the stop button is clicked", () => {
    runCode(
      "from time import sleep\nfor i in range(100):\n\tprint(i)\n\tsleep(1)",
    );
    cy.get("editor-wc").shadow().find(".btn--stop").click();
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should("contain", "Execution interrupted");
  });

  // skip this test for now until we get the headers set up
  it.skip("runs a simple program with an input", () => {
    runCode('name = input("What is your name?")\nprint("Hello", name)');
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "What is your name?");
    cy.get("editor-wc").shadow().find("#input").invoke("text", "Lois{enter}");
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "Hello Lois");
  });

  it("runs a simple program with a built-in python module", () => {
    runCode("from math import floor, pi\nprint(floor(pi))");
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "3");
  });

  it("runs a simple program with a built-in pyodide module", () => {
    runCode(
      "import simplejson as json\nprint(json.dumps(['foo', {'bar': ('baz', None, 1.0, 2)}]))",
    );
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", '["foo", {"bar": ["baz", null, 1.0, 2]}]');
  });

  it("runs a simple pygal program", () => {
    runCode(
      "import pygal\nbar_chart = pygal.Bar()\nbar_chart.add('Fibonacci', [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55])\nbar_chart.render()",
    );
    cy.get("editor-wc")
      .shadow()
      .find(".pyodiderunner")
      .should("contain", "Fibonacci");
  });

  it("runs a simple matplotlib program", () => {
    runCode(
      "import matplotlib.pyplot as plt\nx = [1,2,3]\ny = [2,4,1]\nplt.plot(x, y)\nplt.title('My first graph!')\nplt.show()",
    );
    cy.wait(3000);
    cy.get("editor-wc")
      .shadow()
      .find(".pyodiderunner")
      .find("img")
      .should("be.visible");
  });

  it("runs a simple program with a module from PyPI", () => {
    runCode(
      "from strsimpy.levenshtein import Levenshtein\nlevenshtein = Levenshtein()\nprint(levenshtein.distance('hello', 'world'))",
    );
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "4");
  });

  it("errors when importing a non-existent module", () => {
    runCode("import i_do_not_exist");
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should(
        "contain",
        "ModuleNotFoundError: No module named 'i_do_not_exist' on line 1 of main.py",
      );
  });
});