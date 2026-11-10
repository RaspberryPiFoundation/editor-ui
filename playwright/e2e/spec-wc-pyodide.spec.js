import path from "node:path";

import { test, expect } from "../fixtures.js";
import {
  ensureFilePanelOpen,
  getActivePyodideRunner,
  getEditorShadow,
  getErrorLine,
  getFileButtonByName,
  getProgramInput,
  getPyodideOutput,
  getResults,
  getRunButton,
  getStopButton,
  getTextOutputTab,
  makeNewFile,
  runCode,
  runProject,
  setCodeEditorContent,
  stopProject,
} from "../helpers/editor.js";

const origin = "http://localhost:3011/web-component.html";
// Playwright compiles specs to CommonJS here (no "type": "module"), so import.meta is unavailable but __dirname works.
const copydeckFixture = path.join(
  __dirname,
  "../../cypress/fixtures/copydeck.json",
);

// Cypress forces `crossOriginIsolated = true` with `cy.window()` so the app picks Pyodide. Same here, except in the chromium-isolated project, where the page is really isolated.
test.use({ crossOriginIsolation: "forced" });

// Pyodide boots on first run and some tests install packages from PyPI, so the per-test budget needs to be well above the 30s default. Cypress has no per-test timeout, only the 10s per-command timeout.
test.describe.configure({ timeout: 120_000 });

// The Pyodide console only, unlike Cypress's getPythonConsoleOutput which also matches the (inactive) Skulpt runner's lines.
const pyodideConsole = (page) =>
  getPyodideOutput(page).locator(".pythonrunner-console");

// The ErrorMessage component renders in both runners from the same Redux state, so the error (and friendly error) appears twice; Cypress's `.find()` matched both. Scope to the Pyodide runner.
const getErrorMessage = (page) =>
  getPyodideOutput(page).locator(".error-message__python");
const getFriendlyErrorMessage = (page) =>
  getPyodideOutput(page).locator(".friendly-error-message");

// Visuals are posted by the worker before handleRunComplete, and the web-component.html test page writes the editor-runCompleted event payload to #results. The page is fresh for each test, so #results is empty until the first run completes.
const waitForRunCompleted = (page, timeout = 90_000) =>
  expect(getResults(page)).toContainText('"errorDetails"', { timeout });

// Cypress also sends COOP/COEP as *request* headers to cy.visit, which has no effect: Vite already sets them as response headers. Not ported.
const visit = async (page, realIsolation, url) => {
  await page.goto(url);
  // In the chromium-isolated project, check the isolation is real rather than assume it.
  if (realIsolation) {
    expect(
      await page.evaluate(() => [
        window.crossOriginIsolated,
        typeof SharedArrayBuffer,
      ]),
    ).toEqual([true, "function"]);
  }
  // Not in the Cypress spec. The Pyodide and Skulpt runners are both always rendered, and Cypress's output queries match either, so these tests would also pass on Skulpt. Fail fast if Pyodide is not the active runner.
  await expect(getActivePyodideRunner(page)).toHaveCount(1);
};

test.describe("Running the code with pyodide", () => {
  test.beforeEach(async ({ page, realIsolation }) => {
    await visit(page, realIsolation, origin);
  });

  test("runs a simple program", async ({ page }) => {
    await runCode(page, 'print("Hello world")');
    await expect(pyodideConsole(page)).toContainText("Hello world");
    // Asserted after the output, not straight after clicking Run as in Cypress, so a visual tab that appears during the run would be caught.
    await expect(getPyodideOutput(page)).not.toContainText("Visual output");
    await expect(getPyodideOutput(page)).toContainText("Text output");
  });

  test("interrupts the code when the stop button is clicked", async ({
    page,
  }) => {
    await runCode(
      page,
      "from time import sleep\nfor i in range(100):\n\tprint(i)\n\tsleep(1)",
    );
    await expect(pyodideConsole(page)).toContainText("3", { timeout: 60_000 });
    await stopProject(page);
    await expect(getErrorMessage(page)).toContainText("Execution interrupted");
  });

  test("interrupts code that continuously writes output", async ({ page }) => {
    await runCode(page, "i = 0\nwhile True:\n\tprint(i)\n\ti += 1");
    await expect(pyodideConsole(page)).toContainText("Output limit reached", {
      timeout: 60_000,
    });
    await stopProject(page);
    await expect(getErrorMessage(page)).toContainText("Execution interrupted");
  });

  test("runs a simple program with an input", async ({ page }) => {
    await runCode(
      page,
      'name = input("What is your name?")\nprint("Hello", name)',
    );
    await expect(getStopButton(page)).toBeVisible();
    await expect(pyodideConsole(page)).toContainText("What is your name?", {
      timeout: 60_000,
    });
    await expect(getProgramInput(page)).toBeVisible();
    await getProgramInput(page).click();
    await page.keyboard.type("Lois");
    await page.keyboard.press("Enter");
    await expect(pyodideConsole(page)).toContainText("Hello Lois");
  });

  test("runs a simple program to write to a file", async ({ page }) => {
    await runCode(
      page,
      'with open("output.txt", "w") as f:\n\tf.write("Hello world")',
    );
    await ensureFilePanelOpen(page);
    await getFileButtonByName(page, "output.txt").click({ timeout: 60_000 });
    await expect(getEditorShadow(page).locator(".cm-editor")).toContainText(
      "Hello world",
    );
  });

  test("errors when trying to write to an existing file in 'x' mode", async ({
    page,
  }) => {
    await runCode(
      page,
      'with open("output.txt", "w") as f:\n\tf.write("Hello world")',
    );
    await ensureFilePanelOpen(page);
    await expect(getFileButtonByName(page, "output.txt")).toBeVisible({
      timeout: 60_000,
    });
    await runCode(
      page,
      'with open("output.txt", "x") as f:\n\tf.write("Something else")',
    );
    await expect(getErrorMessage(page)).toContainText(
      "FileExistsError: File 'output.txt' already exists on line 1 of main.py",
    );
  });

  for (const mode of ["w", "a", "x"]) {
    test(`errors when writing to a file without an extension in '${mode}' mode`, async ({
      page,
    }) => {
      await runCode(
        page,
        `with open("test", "${mode}") as f:\n\tf.write("Hello world")`,
      );
      await expect(getErrorMessage(page)).toContainText(
        "OSError: File 'test' must have an extension",
        { timeout: 60_000 },
      );
      await ensureFilePanelOpen(page);
      await expect(
        getEditorShadow(page).getByRole("button", { name: /^test/ }),
      ).toHaveCount(0);
    });
  }

  test("errors when writing to a file with consecutive dots in its name", async ({
    page,
  }) => {
    await runCode(
      page,
      'with open("test..txt", "w") as f:\n\tf.write("Hello world")',
    );
    await expect(getErrorMessage(page)).toContainText(
      "OSError: File 'test..txt' is not a valid file name",
      { timeout: 60_000 },
    );
    await ensureFilePanelOpen(page);
    await expect(
      getEditorShadow(page).getByRole("button", { name: /^test/ }),
    ).toHaveCount(0);
  });

  test("updates the file in the editor when the content is updated programmatically", async ({
    page,
  }) => {
    await runCode(
      page,
      'with open("output.txt", "w") as f:\n\tf.write("Hello world")',
    );
    await setCodeEditorContent(
      page,
      'with open("output.txt", "a") as f:\n\tf.write("Hello again world")',
    );
    await ensureFilePanelOpen(page);
    await getFileButtonByName(page, "output.txt").click({ timeout: 60_000 });
    await expect(getRunButton(page)).toBeEnabled();
    await runProject(page);
    await expect(getEditorShadow(page).locator(".cm-editor")).toContainText(
      "Hello again world",
    );
  });

  test("runs a simple program with a built-in python module", async ({
    page,
  }) => {
    await runCode(page, "from math import floor, pi\nprint(floor(pi))");
    await expect(pyodideConsole(page)).toContainText("3", { timeout: 60_000 });
  });

  test("runs a program with multiple files", async ({ page }) => {
    await setCodeEditorContent(
      page,
      `from my_number import NUMBER\nprint(NUMBER)\n`,
    );

    await ensureFilePanelOpen(page);
    await makeNewFile(page, "my_number.py");

    await setCodeEditorContent(page, `NUMBER = 42\n`);

    await runProject(page);

    await expect(getTextOutputTab(page)).toContainText("42", {
      timeout: 60_000,
    });
  });

  test("reloads imported local files between code runs", async ({ page }) => {
    await setCodeEditorContent(page, `from helper import b\nb()`);

    await ensureFilePanelOpen(page);
    await makeNewFile(page, "helper.py");

    await setCodeEditorContent(page, `def b():\n  print('one')`);

    await runProject(page);

    await expect(getTextOutputTab(page)).toContainText("one", {
      timeout: 60_000,
    });

    await setCodeEditorContent(page, `def b():\n  print('two')`);

    await runProject(page);

    await expect(getTextOutputTab(page)).toContainText("two");
  });

  test("runs a simple program with a built-in pyodide module", async ({
    page,
  }) => {
    await runCode(
      page,
      "import simplejson as json\nprint(json.dumps(['foo', {'bar': ('baz', None, 1.0, 2)}]))",
    );
    await expect(pyodideConsole(page)).toContainText(
      '["foo", {"bar": ["baz", null, 1.0, 2]}]',
      { timeout: 60_000 },
    );
  });

  test("runs a simple bar chart pygal program", async ({ page }) => {
    await runCode(
      page,
      "import pygal\nbar_chart = pygal.Bar()\nbar_chart.add('Fibonacci', [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55])\nbar_chart.render()",
    );
    await expect(getPyodideOutput(page)).toContainText("Fibonacci", {
      timeout: 60_000,
    });
  });

  test("runs a simple pygal pie chart program", async ({ page }) => {
    await runCode(
      page,
      "from pygal import Pie\nchart = Pie()\nchart.add('Cats', 5)\nchart.add('Dogs', 10)\nchart.add('Rabbits', 10)\nchart.render()",
    );
    // Cypress checks `getErrorMessage().should("not.exist")` straight after clicking Run, before the code has run, so it passes vacuously. Wait for the run to complete first.
    await waitForRunCompleted(page);
    await expect(getErrorMessage(page)).toHaveCount(0);
    await expect(getPyodideOutput(page)).toContainText("Cats");
  });

  test("runs a simple matplotlib program", async ({ page }) => {
    await runCode(
      page,
      "import matplotlib.pyplot as plt\nx = [1,2,3]\ny = [2,4,1]\nplt.plot(x, y)\nplt.title('My first graph!')\nplt.show()",
    );
    // Replaces cy.wait(5000): the run-completed event.
    await waitForRunCompleted(page);
    await expect(getPyodideOutput(page).locator("img")).toBeVisible();
  });

  test("runs a simple seaborn program", async ({ page }) => {
    await runCode(
      page,
      "import seaborn as sns\ndata = [50, 30, 100]\nsns.displot(data)",
    );
    // Replaces cy.wait(12000): the run-completed event.
    await waitForRunCompleted(page);
    await expect(getPyodideOutput(page).locator("img")).toBeVisible();
  });

  test("runs a simple plotly program", async ({ page }) => {
    await runCode(
      page,
      'import plotly.express as px\ndf = px.data.gapminder().query("country==\'Canada\'")\nfig = px.line(df, x="year", y="lifeExp", title=\'Life expectancy in Canada\')\nfig.show()',
    );
    // Replaces cy.wait(3000): the run-completed event. Plotly then renders on the main thread, which the 10s expect timeout covers.
    await waitForRunCompleted(page);
    await expect(
      getPyodideOutput(page).locator("div.js-plotly-plot"),
    ).toBeVisible();
  });

  test("runs a simple urllib program", async ({ page }) => {
    // pyodide_http turns urllib into a synchronous XMLHttpRequest from the Pyodide worker; page.route and context.route both intercept it, with or without real isolation. No CORS header is needed even under real isolation: the request never leaves the browser.
    await page.route("https://www.my-amazing-website.com/", (route) =>
      route.fulfill({ status: 200 }),
    );
    await runCode(
      page,
      "import urllib.request\nresponse = urllib.request.urlopen('https://www.my-amazing-website.com')\nprint(response.getcode())",
    );
    await expect(pyodideConsole(page)).toContainText("200", {
      timeout: 60_000,
    });
  });

  test("runs a simple program with a module from PyPI", async ({ page }) => {
    await runCode(
      page,
      "from strsimpy.levenshtein import Levenshtein\nlevenshtein = Levenshtein()\nprint(levenshtein.distance('hello', 'world'))",
    );
    await expect(pyodideConsole(page)).toContainText("4", { timeout: 60_000 });
  });

  test("runs a simple program with the py-enigma library", async ({ page }) => {
    await runCode(
      page,
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
    await expect(pyodideConsole(page)).toContainText("ULRYQJMVHLFQKBEFUGEOFL", {
      timeout: 60_000,
    });
  });

  test("shows and highlights an error when importing a non-existent module", async ({
    page,
  }) => {
    await runCode(page, "import i_do_not_exist");
    await expect(getErrorMessage(page)).toContainText(
      "ModuleNotFoundError: No module named 'i_do_not_exist' on line 1 of main.py",
      { timeout: 60_000 },
    );
    await expect(getErrorLine(page)).toHaveCount(1);
    await expect(getErrorLine(page)).toContainText("import i_do_not_exist");
  });

  test("clears user-defined variables between code runs", async ({ page }) => {
    await runCode(page, "a = 1\nprint(a)");
    await expect(pyodideConsole(page)).toContainText("1", { timeout: 60_000 });
    await runCode(page, "print(a)");
    await expect(getErrorMessage(page)).toContainText(
      "NameError: name 'a' is not defined",
    );
  });

  test("clears user-defined functions between code runs", async ({ page }) => {
    await runCode(page, "def my_function():\n\treturn 1\nprint(my_function())");
    await expect(pyodideConsole(page)).toContainText("1", { timeout: 60_000 });
    await runCode(page, "print(my_function())");
    await expect(getErrorMessage(page)).toContainText(
      "NameError: name 'my_function' is not defined",
    );
  });

  test("clears user-imported modules between code runs", async ({ page }) => {
    await runCode(page, "import math\nprint(math.floor(math.pi))");
    await expect(pyodideConsole(page)).toContainText("3", { timeout: 60_000 });
    await runCode(page, "print(math.floor(math.pi))");
    await expect(getErrorMessage(page)).toContainText(
      "NameError: name 'math' is not defined",
    );
  });

  test("clears a user-defined variable named 'name' between code runs", async ({
    page,
  }) => {
    await runCode(page, "name = 'Jane'\nprint(name)");
    await expect(pyodideConsole(page)).toContainText("Jane", {
      timeout: 60_000,
    });
    await runCode(page, "print(name)");
    await expect(getErrorMessage(page)).toContainText(
      "NameError: name 'name' is not defined",
    );
  });

  test("clears a user-defined variable named 'sys' between code runs", async ({
    page,
  }) => {
    await runCode(page, "sys = 1\nprint(sys)");
    await expect(pyodideConsole(page)).toContainText("1", { timeout: 60_000 });
    await runCode(page, "print(sys)");
    await expect(getErrorMessage(page)).toContainText(
      "NameError: name 'sys' is not defined",
    );
  });
});

test.describe("When friendly errors enabled with pyodide", () => {
  test.beforeEach(async ({ page, realIsolation }) => {
    await page.route("**/python-error-copydecks/**", (route) =>
      route.fulfill({ path: copydeckFixture }),
    );
    const copydeckRequest = page.waitForRequest("**/python-error-copydecks/**");

    const params = new URLSearchParams();
    params.set("friendly_errors_enabled", "true");
    await visit(page, realIsolation, `${origin}?${params.toString()}`);
    await copydeckRequest;
  });

  test("shows a friendly error message when an error occurs", async ({
    page,
  }) => {
    await runCode(page, "print(kitten)");
    await expect(getErrorMessage(page)).toContainText(
      "NameError: name 'kitten' is not defined on line 1 of main.py",
      { timeout: 60_000 },
    );
    await expect(getFriendlyErrorMessage(page)).toContainText(
      "This variable doesn't exist here",
    );
  });
});
