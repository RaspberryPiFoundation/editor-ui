import {
  getErrorMessage,
  getEditorShadow,
  getPyodideOutput,
  getPythonConsoleOutput,
} from "../helpers/editor.js";

const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers["Origin"] = origin;
  });
});

const runCode = (code) => {
  // Add extra newline to ensure any tooltips are dismissed so they don't get in the way of the run button
  getEditorShadow()
    .findByLabelText("editor text input")
    .invoke("text", `${code}\n`);
  getEditorShadow().find(".btn--run").should("not.be.disabled").click();
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
    getPyodideOutput()
      .contains(".react-tabs__tab", "Visual output")
      .should("not.exist");
    getPyodideOutput()
      .find(".react-tabs__tab--selected")
      .should("contain", "Text output");
    getPythonConsoleOutput().should("contain", "Hello world");
  });

  it("interrupts the code when the stop button is clicked", () => {
    runCode(
      "from time import sleep\nfor i in range(100):\n\tprint(i)\n\tsleep(1)",
    );
    getPythonConsoleOutput().should("contain", "3");
    getEditorShadow().find(".btn--stop").should("be.visible").click();
    getErrorMessage().should("contain", "Execution interrupted");
  });

  it("runs a simple program with an input", () => {
    runCode('name = input("What is your name?")\nprint("Hello", name)');
    getEditorShadow().find(".btn--stop").should("be.visible");
    getPythonConsoleOutput().should("contain", "What is your name?");
    getEditorShadow().find("#input").should("be.visible").type("Lois{enter}");
    getPythonConsoleOutput().should("contain", "Hello Lois");
  });

  it("runs a simple program to write to a file", () => {
    runCode('with open("output.txt", "w") as f:\n\tf.write("Hello world")');
    getEditorShadow().contains(".files-list-item", "output.txt").click();
    getEditorShadow().find(".cm-editor").should("contain", "Hello world");
  });

  it("errors when trying to write to an existing file in 'x' mode", () => {
    runCode('with open("output.txt", "w") as f:\n\tf.write("Hello world")');
    getEditorShadow().find(".files-list-item").should("contain", "output.txt");
    runCode('with open("output.txt", "x") as f:\n\tf.write("Something else")');
    getErrorMessage().should(
      "contain",
      "FileExistsError: File 'output.txt' already exists on line 1 of main.py",
    );
  });

  it("updates the file in the editor when the content is updated programmatically", () => {
    runCode('with open("output.txt", "w") as f:\n\tf.write("Hello world")');
    getEditorShadow()
      .findByLabelText("editor text input")
      .invoke(
        "text",
        'with open("output.txt", "a") as f:\n\tf.write("Hello again world")',
      );
    getEditorShadow().contains(".files-list-item", "output.txt").click();
    getEditorShadow().find(".btn--run").should("not.be.disabled").click();
    getEditorShadow().find(".cm-editor").should("contain", "Hello again world");
  });

  it("runs a simple program with a built-in python module", () => {
    runCode("from math import floor, pi\nprint(floor(pi))");
    getPythonConsoleOutput().should("contain", "3");
  });

  it("runs a program with multiple files", () => {
    getEditorShadow()
      .findByLabelText("editor text input")
      .invoke("text", `from my_number import NUMBER\nprint(NUMBER)\n`);

    getEditorShadow().findByRole("button", { name: "Add file" }).click();

    getEditorShadow()
      .findByLabelText(/Name your file/)
      .type("my_number.py");

    getEditorShadow()
      .findByRole("dialog")
      .findByRole("button", { name: "Add file" })
      .click();

    getEditorShadow()
      .findByLabelText("editor text input")
      .invoke("text", `NUMBER = 42\n`);

    getEditorShadow().findByRole("button", { name: "Run" }).click();

    getPyodideOutput().findByLabelText("Text output").should("contain", "42");
  });

  it("reloads imported local files between code runs", () => {
    getEditorShadow()
      .findByLabelText("editor text input")
      .invoke("text", `from helper import b\nb()`);

    getEditorShadow().findByRole("button", { name: "Add file" }).click();

    getEditorShadow()
      .findByLabelText(/Name your file/)
      .type("helper.py");

    getEditorShadow()
      .findByRole("dialog")
      .findByRole("button", { name: "Add file" })
      .click();

    getEditorShadow()
      .findByLabelText("editor text input")
      .invoke("text", `def b():\n  print('one')`);

    getEditorShadow().findByRole("button", { name: "Run" }).click();

    getPyodideOutput().findByLabelText("Text output").should("contain", "one");

    getEditorShadow()
      .findByLabelText("editor text input")
      .invoke("text", `def b():\n  print('two')`);

    getEditorShadow().findByRole("button", { name: "Run" }).click();

    getPyodideOutput().findByLabelText("Text output").should("contain", "two");
  });

  it("runs a simple program with a built-in pyodide module", () => {
    runCode(
      "import simplejson as json\nprint(json.dumps(['foo', {'bar': ('baz', None, 1.0, 2)}]))",
    );
    getPythonConsoleOutput().should(
      "contain",
      '["foo", {"bar": ["baz", null, 1.0, 2]}]',
    );
  });

  it("runs a simple bar chart pygal program", () => {
    runCode(
      "import pygal\nbar_chart = pygal.Bar()\nbar_chart.add('Fibonacci', [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55])\nbar_chart.render()",
    );
    getPyodideOutput().should("contain", "Fibonacci");
  });

  it("runs a simple pygal pie chart program", () => {
    runCode(
      "from pygal import Pie\nchart = Pie()\nchart.add('Cats', 5)\nchart.add('Dogs', 10)\nchart.add('Rabbits', 10)\nchart.render()",
    );
    getErrorMessage().should("not.exist");
    getPyodideOutput().should("contain", "Cats");
  });

  it("runs a simple matplotlib program", () => {
    runCode(
      "import matplotlib.pyplot as plt\nx = [1,2,3]\ny = [2,4,1]\nplt.plot(x, y)\nplt.title('My first graph!')\nplt.show()",
    );
    cy.wait(5000);
    getPyodideOutput().find("img").should("be.visible");
  });

  it("runs a simple seaborn program", () => {
    runCode("import seaborn as sns\ndata = [50, 30, 100]\nsns.displot(data)");
    cy.wait(12000);
    getPyodideOutput().find("img").should("be.visible");
  });

  it("runs a simple plotly program", () => {
    runCode(
      'import plotly.express as px\ndf = px.data.gapminder().query("country==\'Canada\'")\nfig = px.line(df, x="year", y="lifeExp", title=\'Life expectancy in Canada\')\nfig.show()',
    );
    cy.wait(3000);
    getPyodideOutput().find("div.js-plotly-plot").should("be.visible");
  });

  it("runs a simple urllib program", () => {
    cy.intercept("GET", "https://www.my-amazing-website.com", {
      statusCode: 200,
    });
    runCode(
      "import urllib.request\nresponse = urllib.request.urlopen('https://www.my-amazing-website.com')\nprint(response.getcode())",
    );
    getPythonConsoleOutput().should("contain", "200");
  });

  it("runs a simple program with a module from PyPI", () => {
    runCode(
      "from strsimpy.levenshtein import Levenshtein\nlevenshtein = Levenshtein()\nprint(levenshtein.distance('hello', 'world'))",
    );
    getPythonConsoleOutput().should("contain", "4");
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
    getPythonConsoleOutput().should("contain", "ULRYQJMVHLFQKBEFUGEOFL");
  });

  it("errors when importing a non-existent module", () => {
    runCode("import i_do_not_exist");
    getErrorMessage().should(
      "contain",
      "ModuleNotFoundError: No module named 'i_do_not_exist' on line 1 of main.py",
    );
  });

  it("clears user-defined variables between code runs", () => {
    runCode("a = 1\nprint(a)");
    getPythonConsoleOutput().should("contain", "1");
    runCode("print(a)");
    getErrorMessage().should("contain", "NameError: name 'a' is not defined");
  });

  it("clears user-defined functions between code runs", () => {
    runCode("def my_function():\n\treturn 1\nprint(my_function())");
    getPythonConsoleOutput().should("contain", "1");
    runCode("print(my_function())");
    getErrorMessage().should(
      "contain",
      "NameError: name 'my_function' is not defined",
    );
  });

  it("clears user-imported modules between code runs", () => {
    runCode("import math\nprint(math.floor(math.pi))");
    getPythonConsoleOutput().should("contain", "3");
    runCode("print(math.floor(math.pi))");
    getErrorMessage().should(
      "contain",
      "NameError: name 'math' is not defined",
    );
  });
});
