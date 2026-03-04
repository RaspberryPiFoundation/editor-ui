const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers.Origin = origin;
    req.continue();
  });
});

describe("Running the code with ruby", () => {
  beforeEach(() => {
    cy.visit(origin);
  });

  it("loads cool-ruby and runs main.rb", () => {
    cy.window().then((win) => {
      win.document
        .querySelector("#sample-projects-bar a[data-project='cool-ruby']")
        .click();
    });

    cy.get("editor-wc")
      .shadow()
      .contains(".files-list-item", "main.rb")
      .should("be.visible");

    cy.get("editor-wc")
      .shadow()
      .find(".btn--run")
      .should("not.be.disabled")
      .click();

    cy.get("#results")
      .invoke("text")
      .should("not.equal", "")
      .then((resultText) => {
        cy.task("log", `Ruby run result payload: ${resultText}`);
        expect(resultText).to.contain('"isErrorFree":true');
      });

    cy.get("editor-wc")
      .shadow()
      .find(".pyodiderunner .pythonrunner-console-output-line")
      .should("contain.text", "Hello, World!");
  });
});
