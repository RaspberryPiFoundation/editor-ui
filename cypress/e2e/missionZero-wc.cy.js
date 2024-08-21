const baseUrl = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.visit(`${baseUrl}?sense_hat_always_enabled=true`);
});

it("defaults to the visual output tab", () => {
  const runnerContainer = cy
    .get("editor-wc")
    .shadow()
    .find(".proj-runner-container");
  runnerContainer
    .find(".react-tabs__tab--selected")
    .should("contain", "Visual output");
});

it("renders the astro pi component on page load", () => {
  cy.get("editor-wc").shadow().find("#root").should("contain", "yaw");
});

it("keeps astro pi component if code run without sense hat imported", () => {
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke("text", "");
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("editor-wc").shadow().find("#root").should("contain", "yaw");
});

it("loads the sense hat library", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", "from sense_hat import SenseHat");
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("contain", '"isErrorFree":true');
});

it("sets initial criteria correctly", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", "from sense_hat import SenseHat");
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should(
    "contain",
    '"noInputEvents":true,"readColour":false,"readHumidity":false,"readPressure":false,"readTemperature":false,"usedLEDs":false',
  );
});

it("checks colour has been read correctly", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", "from sense_hat import SenseHat\nSenseHat().colour.colour");
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("contain", '"readColour":true');
});

it("checks temperature has been read correctly", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      "from sense_hat import SenseHat\nSenseHat().get_temperature()",
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("contain", '"readTemperature":true');
});

it("checks humidity has been read correctly", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      "from sense_hat import SenseHat\nSenseHat().get_humidity()",
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("contain", '"readHumidity":true');
});

it("checks pressure has been read correctly", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      "from sense_hat import SenseHat\nSenseHat().get_pressure()",
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("contain", '"readPressure":true');
});

it("resets criteria correctly", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      "from sense_hat import SenseHat\nsense = SenseHat()\nsense.get_pressure()\nsense.get_humidity()\nsense.get_temperature()",
    );
  cy.get("editor-wc").shadow().find(".btn--run").contains("Run").click();
  cy.get("#results").should("contain", '"readPressure":true');
  cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke("text", "");
  cy.get("editor-wc").shadow().find(".btn--run").contains("Run").click();
  cy.get("#results").should(
    "contain",
    '"noInputEvents":true,"readColour":false,"readHumidity":false,"readPressure":false,"readTemperature":false,"usedLEDs":false',
  );
});

it("confirms LEDs used when single led set", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      "from sense_hat import SenseHat\nSenseHat().set_pixel(0, 0, 100, 100, 100)",
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("contain", '"usedLEDs":true');
});

it("confirms LEDs used when display set", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      "from sense_hat import SenseHat\nsense = SenseHat()\nsense.set_pixels([[100,0,0]] * 64)",
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.scrollTo("bottom");
  cy.get("#results").should("contain", '"usedLEDs":true');
});

it("picks up calls to input()", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", "input()");
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("editor-wc").shadow().contains("Text output").click();
  cy.get("editor-wc")
    .shadow()
    .find("span[contenteditable=true]")
    .type("{enter}");
  cy.get("#results").should("contain", '"noInputEvents":false');
});

it("picks up calls to wait for motion", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      "from sense_hat import SenseHat\nsense = SenseHat()\nsense.motion.wait_for_motion()",
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("contain", '"noInputEvents":false');
});

it("picks up errors from the editor", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", "zkgjdlzjgl");
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("contain", '"isErrorFree":false');
});

it("does not return null duration if no change in focus", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      'from sense_hat import SenseHat\nsense = SenseHat()\nsense.send_message("a")',
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("not.contain", '"duration":null');
});

it("does not return null duration if focus changed before code run", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      'from sense_hat import SenseHat\nsense = SenseHat()\nsense.send_message("a")',
    );
  cy.window().blur();
  cy.window().focus();
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("not.contain", '"duration":null');
});

it("returns duration of null if focus is lost", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      'from sense_hat import SenseHat\nsense = SenseHat()\nsense.send_message("a")',
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.window().blur();
  cy.window().focus();
  cy.get("#results").should("contain", '"duration":null');
});

it("does not return duration of null if code rerun after focus lost", () => {
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      'from sense_hat import SenseHat\nsense = SenseHat()\nsense.send_message("a")',
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.window().blur();
  cy.window().focus();
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("#results").should("not.contain", '"duration":null');
});
