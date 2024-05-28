const origin = "http://localhost:3001";

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

  it("renders the web component", () => {
    cy.get("editor-wc").shadow().find("button").should("contain", "Run");
  });

  it("defaults to the text output tab", () => {
    const runnerContainer = cy
      .get("editor-wc")
      .shadow()
      .find(".proj-runner-container");
    runnerContainer
      .find(".react-tabs__tab--selected")
      .should("contain", "Text output");
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

  it("runs p5 code", () => {
    const code = `from p5 import *\n\ndef setup():\n    size(400, 400)  # width and height of screen\n\ndef draw():\n    fill('cyan')  # Set the fill color for the sky to cyan\n    rect(0, 0, 400, 250)  # Draw a rectangle for the sky with these values for x, y, width, height    \n  \nrun(frame_rate=2)\n`;
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", code);
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().find(".p5Canvas").should("exist");
  });

  it("does not render visual output tab on page load", () => {
    cy.get("editor-wc")
      .shadow()
      .find("#root")
      .should("not.contain", "Visual output");
  });

  it("renders visual output tab if sense hat imported", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import sense_hat");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().find("#root").should("contain", "Visual output");
  });

  it("does not render astro pi component on page load", () => {
    cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw");
  });

  it("renders astro pi component if sense hat imported", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import sense_hat");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().contains("Visual output").click();
    cy.get("editor-wc").shadow().find("#root").should("contain", "yaw");
  });

  it("does not render astro pi component if sense hat unimported", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import sense_hat");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().find("div[class=cm-content]").invoke("text", "");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().contains("Visual output").click();
    cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw");
  });
});

describe("when load_remix_disabled is true, e.g. in editor-standalone", () => {
  // Must match HydraPublicApiClient::BYPASS_AUTH_USER_ID in editor-api
  const authKey = "00000000-0000-0000-0000-000000000000";

  const user = { access_token: "dummy-access-token" };
  const originalIdentifier = "blank-python-starter";

  let baseUrl;

  beforeEach(() => {
    const params = new URLSearchParams();
    params.set("auth_key", authKey);
    params.set("identifier", originalIdentifier);
    params.set("load_remix_disabled", "true");
    baseUrl = `${origin}?${params.toString()}`;

    cy.on('window:before:load', (win) => {
      win.localStorage.setItem(authKey, JSON.stringify(user));
    });
  });

  it("loads the original project in preference to the remixed version", () => {
    // Visit the original project URL
    cy.visit(baseUrl);
    cy.get("#project-identifier").should("have.text", originalIdentifier);

    // Edit code
    cy.get("editor-wc").shadow().find("[contenteditable]").type("# remixed!");

    // Save project
    cy.get("editor-wc").shadow().contains("Save").click();

    // Check receipt of an event to trigger a redirect to the remixed project URL
    cy.get("#project-identifier").should("not.have.text", originalIdentifier);

    // Check we're still seeing the changed code
    cy.get("editor-wc").shadow().find("[contenteditable]").should("have.text", "# remixed!");

    // Visit the original project URL
    cy.visit(baseUrl);

    // Check we no longer see the changed code, i.e. `load_remix_disabled=true` is respected
    cy.get("editor-wc").shadow().find("[contenteditable]").should("not.have.text", "# remixed!");
  });
});
