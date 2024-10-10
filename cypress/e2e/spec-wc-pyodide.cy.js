const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers["Origin"] = origin;
    req.continue();
  });
});

describe("default behaviour", () => {
  beforeEach(() => {
    cy.visit(origin);
  });

  it("runs the python code", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", 'print("Hello world")');
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc")
      .shadow()
      .find(".pythonrunner-console-output-line")
      .should("contain", "Hello world");
  });

  it("interrupts the code when the stop button is clicked", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke(
        "text",
        "from time import sleep\nfor i in range(100):\n\tprint(i)\n\tsleep(1)",
      );
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().find(".btn--stop").click();
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should("contain", "Execution interrupted");
  });
});
