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
      .find(".pyodiderunner")
      .contains(".react-tabs__tab", "Visual output")
      .should("not.exist");
    cy.get("editor-wc")
      .shadow()
      .find(".pyodiderunner")
      .find(".react-tabs__tab--selected")
      .should("contain", "Text output");
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

  it("runs a simple program to write to a file", () => {
    runCode('with open("output.txt", "w") as f:\n\tf.write("Hello world")');
    cy.get("editor-wc")
      .shadow()
      .contains(".files-list-item", "output.txt")
      .click();
    cy.get("editor-wc")
      .shadow()
      .find(".cm-editor")
      .should("contain", "Hello world");
  });

  it("errors when trying to write to an existing file in 'x' mode", () => {
    runCode('with open("output.txt", "w") as f:\n\tf.write("Hello world")');
    cy.get("editor-wc")
      .shadow()
      .find(".files-list-item")
      .should("contain", "output.txt");
    runCode('with open("output.txt", "x") as f:\n\tf.write("Something else")');
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should(
        "contain",
        "FileExistsError: File 'output.txt' already exists on line 1 of main.py",
      );
  });

  it("updates the file in the editor when the content is updated programatically", () => {
    runCode('with open("output.txt", "w") as f:\n\tf.write("Hello world")');
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke(
        "text",
        'with open("output.txt", "a") as f:\n\tf.write("Hello again world")',
      );
    cy.get("editor-wc")
      .shadow()
      .contains(".files-list-item", "output.txt")
      .click();
    cy.get("editor-wc")
      .shadow()
      .find(".btn--run")
      .should("not.be.disabled")
      .click();
    cy.get("editor-wc")
      .shadow()
      .find(".cm-editor")
      .should("contain", "Hello again world");
  });

  it("runs a simple program with a built-in python module", () => {
    runCode("from math import floor, pi\nprint(floor(pi))");
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "3");
  });

  it("runs a program with muiltiple files", () => {
    cy.get("editor-wc")
      .shadow()
      .findByLabelText('editor text input')
      .invoke("text", `from my_number import NUMBER\nprint(NUMBER)\n`);

    cy.get("editor-wc")
      .shadow()
      .findByRole('button', { name: 'Add file' }).click()

    cy.get("editor-wc")
      .shadow()
      .children()
      .findByLabelText(/Name your file/)
      .type("my_number.py");

    cy.get("editor-wc")
      .shadow()
      .findByRole('dialog')
      .findByRole('button', { name: 'Add file' }).click()

    cy.get("editor-wc")
      .shadow()
      .findByLabelText('editor text input')
      .invoke("text", `NUMBER = 42\n`);

    cy.get("editor-wc")
      .shadow()
      .findByRole('button', { name: 'Run' }).click()

    cy.get("editor-wc")
      .shadow()
      .children()
      .find(".pyodiderunner")
      .findByLabelText('Text output')
      .should("contain", "42");
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

  it("runs a simple plotly program", () => {
    runCode(
      'import plotly.express as px\ndf = px.data.gapminder().query("country==\'Canada\'")\nfig = px.line(df, x="year", y="lifeExp", title=\'Life expectancy in Canada\')\nfig.show()',
    );
    cy.wait(3000);
    cy.get("editor-wc")
      .shadow()
      .find(".pyodiderunner")
      .find("div.js-plotly-plot")
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
