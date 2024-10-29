const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers["Origin"] = origin;
  });
});

const runCode = (code) => {
  // Add extra newline to ensure any tooltips are dismissed so they don't get in the way of the run button
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", `${code}\n`);
  cy.get("editor-wc")
    .shadow()
    .find(".btn--run")
    .should("not.be.disabled")
    .click();
};

describe("Running the code with pyodide", () => {
  beforeEach(() => {
    cy.visit({
      url: origin,
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    });
    cy.window().then((win) => {
      Object.defineProperty(win, "crossOriginIsolated", {
        value: true,
        configurable: true,
      });
    });
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
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "3");
    cy.get("editor-wc")
      .shadow()
      .find(".btn--stop")
      .should("be.visible")
      .click();
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should("contain", "Execution interrupted");
  });

  it("runs a simple program with an input", () => {
    runCode('name = input("What is your name?")\nprint("Hello", name)');
    cy.get("editor-wc").shadow().find(".btn--stop").should("be.visible");
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "What is your name?");
    cy.get("editor-wc")
      .shadow()
      .find("#input")
      .should("be.visible")
      .type("Lois{enter}");
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
    cy.wait(5000);
    cy.get("editor-wc")
      .shadow()
      .find(".pyodiderunner")
      .find("img")
      .should("be.visible");
  });

  it("runs a simple seaborn program", () => {
    runCode("import seaborn as sns\ndata = [50, 30, 100]\nsns.displot(data)");
    cy.wait(12000);
    cy.get("editor-wc")
      .shadow()
      .find(".pyodiderunner")
      .find("img")
      .should("be.visible");
  });

  it("runs a simple urllib program", () => {
    cy.intercept("GET", "https://www.my-amazing-website.com", {
      statusCode: 200,
    });
    runCode(
      "import urllib.request\nresponse = urllib.request.urlopen('https://www.my-amazing-website.com')\nprint(response.getcode())",
    );
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "200");
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

  it("runs a simple program with the py-enigma library", () => {
    runCode(
      `
from enigma.machine import EnigmaMachine
# Sheet settings
ROTORS = "IV I V"
RINGS = "20 5 10"
PLUGBOARD = "KT AJ IV US NY HL GD XF PB CQ"
def use_enigma_machine(msg, rotor_start):
  # Set up the Enigma machine
  machine = EnigmaMachine.from_key_sheet(rotors=ROTORS, reflector="B", ring_settings=RINGS, plugboard_settings=PLUGBOARD)
  # Set the initial position of the rotors
  machine.set_display(rotor_start)
  # Encrypt or decrypt the message
  transformed_msg = machine.process_text(msg)
  return(transformed_msg)
text_in = "This is a test message"
rotor_start = "FNZ"
text_out = use_enigma_machine(text_in, rotor_start)
print(text_out)
      `,
    );
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "ULRYQJMVHLFQKBEFUGEOFL");
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

  it("clears user-defined variables between code runs", () => {
    runCode("a = 1\nprint(a)");
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "1");
    runCode("print(a)");
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should("contain", "NameError: name 'a' is not defined");
  });

  it("clears user-defined functions between code runs", () => {
    runCode("def my_function():\n\treturn 1\nprint(my_function())");
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "1");
    runCode("print(my_function())");
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should("contain", "NameError: name 'my_function' is not defined");
  });

  it("clears user-imported modules between code runs", () => {
    runCode("import math\nprint(math.floor(math.pi))");
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "3");
    runCode("print(math.floor(math.pi))");
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should("contain", "NameError: name 'math' is not defined");
  });
});
