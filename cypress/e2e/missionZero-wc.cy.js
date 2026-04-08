import {
  getProgramInput,
  getPythonConsoleOutput,
  getResults,
  getRunButton,
  getSkulptRunner,
  getSkulptSelectedTab,
  getSkulptTabByName,
  getStopButton,
  runCode,
  runProject,
  setCodeEditorContent,
} from "../helpers/editor.js";

const baseUrl = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.visit(`${baseUrl}?sense_hat_always_enabled=true`);
});

it("defaults to the visual output tab", () => {
  getSkulptSelectedTab().should("contain", "Visual output");
});

it("renders the astro pi component on page load", () => {
  getSkulptRunner().should("contain", "yaw");
});

it("keeps astro pi component if code run without sense hat imported", () => {
  setCodeEditorContent("");
  runProject();

  getSkulptRunner().should("contain", "yaw");
});

it("loads the sense hat library", () => {
  runCode("from sense_hat import SenseHat");

  getResults().should("contain", '"isErrorFree":true');
});

it("sets initial criteria correctly", () => {
  runCode("");

  getResults().should(
    "contain",
    '"noInputEvents":true,"readColour":false,"readHumidity":false,"readPressure":false,"readTemperature":false,"usedLEDs":false',
  );
});

it("checks colour has been read correctly", () => {
  runCode("from sense_hat import SenseHat\nSenseHat().colour.colour");

  getResults().should("contain", '"readColour":true');
});

it("checks temperature has been read correctly", () => {
  runCode("from sense_hat import SenseHat\nSenseHat().get_temperature()");

  getResults().should("contain", '"readTemperature":true');
});

it("checks humidity has been read correctly", () => {
  runCode("from sense_hat import SenseHat\nSenseHat().get_humidity()");

  getResults().should("contain", '"readHumidity":true');
});

it("checks pressure has been read correctly", () => {
  runCode("from sense_hat import SenseHat\nSenseHat().get_pressure()");

  getResults().should("contain", '"readPressure":true');
});

it("resets criteria correctly", () => {
  runCode(
    "from sense_hat import SenseHat\nsense = SenseHat()\nsense.get_pressure()\nsense.get_humidity()\nsense.get_temperature()",
  );
  getResults().should("contain", '"readPressure":true');

  runCode("from sense_hat import SenseHat");
  getResults().should(
    "contain",
    '"noInputEvents":true,"readColour":false,"readHumidity":false,"readPressure":false,"readTemperature":false,"usedLEDs":false',
  );
});

it("confirms LEDs used when single led set", () => {
  runCode(
    "from sense_hat import SenseHat\nSenseHat().set_pixel(0, 0, 100, 100, 100)",
  );

  getResults().should("contain", '"usedLEDs":true');
});

it("confirms LEDs used when display set", () => {
  runCode(
    "from sense_hat import SenseHat\nsense = SenseHat()\nsense.set_pixels([[100,0,0]] * 64)",
  );

  cy.scrollTo("bottom");
  getResults().should("contain", '"usedLEDs":true');
});

it("picks up calls to input()", () => {
  runCode("name = input('What is your name?')\nprint('Hello', name)");

  getStopButton().should("be.visible");
  getSkulptTabByName("Text output").click();
  getProgramInput().type("Scott{enter}");

  getResults().should("contain", '"noInputEvents":false');
  getPythonConsoleOutput().should("contain", "Hello Scott");
});

it("picks up calls to wait for motion", () => {
  runCode(
    "from sense_hat import SenseHat\nsense = SenseHat()\nsense.motion.wait_for_motion()",
  );

  getResults().should("contain", '"noInputEvents":false');
});

it("picks up errors from the editor", () => {
  runCode("zkgjdlzjgl");

  getResults().should("contain", '"isErrorFree":false');
});

it("does not return null duration if no change in focus", () => {
  runCode(
    'from sense_hat import SenseHat\nsense = SenseHat()\nsense.show_message("a")',
  );

  getResults().should("not.contain", '"duration":null');
});

it("does not return null duration if focus changed before code run", () => {
  setCodeEditorContent(
    'from sense_hat import SenseHat\nsense = SenseHat()\nsense.show_message("a")',
  );
  cy.window().blur();
  cy.window().focus();
  runProject();

  getResults().should("not.contain", '"duration":null');
});

it("returns duration of null if focus is lost", () => {
  setCodeEditorContent(
    'from sense_hat import SenseHat\nsense = SenseHat()\nsense.show_message("a")',
  );
  getRunButton().should("not.be.disabled");
  runProject();
  getStopButton().should("be.visible");
  cy.window().blur();
  cy.window().focus();

  getResults().should("contain", '"duration":null');
});

it("does not return duration of null if code rerun after focus lost", () => {
  setCodeEditorContent(
    'from sense_hat import SenseHat\nsense = SenseHat()\nsense.show_message("a")',
  );
  runProject();
  cy.window().blur();
  cy.window().focus();
  runProject();

  getResults().should("not.contain", '"duration":null');
});
