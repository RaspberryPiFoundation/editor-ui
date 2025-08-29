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

  it("renders the web component", () => {
    cy.get("editor-wc")
      .shadow()
      .find("button")
      .should("contain", "runButton.run");
  });

  it("defaults to the text output tab", () => {
    const runnerContainer = cy
      .get("editor-wc")
      .shadow()
      .find(".proj-runner-container");
    runnerContainer
      .find(".react-tabs__tab--selected")
      .should("contain", "output.textOutput");
  });

  it("does not render visual output tab on page load", () => {
    cy.get("editor-wc")
      .shadow()
      .find("#root")
      .should("not.contain", "output.visualOutput");
  });
});

describe("when load_remix_disabled is true, e.g. in editor-standalone", () => {
  const authKey = `oidc.user:https://auth-v1.raspberrypi.org:editor-api`;

  const user = { access_token: "dummy-access-token" };
  const originalIdentifier = "blank-python-starter";

  const urlFor = (identifier) => {
    const params = new URLSearchParams();
    params.set("auth_key", authKey);
    params.set("identifier", identifier);
    params.set("load_remix_disabled", "true");
    return `${origin}?${params.toString()}`;
  };

  beforeEach(() => {
    cy.on("window:before:load", (win) => {
      win.localStorage.setItem(authKey, JSON.stringify(user));
    });
  });

  it.skip("loads the original project in preference to the remixed version", () => {
    // View the original project
    cy.visit(urlFor(originalIdentifier));
    cy.get("#project-identifier").should("have.text", originalIdentifier);

    // Edit code
    cy.get("editor-wc").shadow().find("[contenteditable]").type("# remixed!");

    // Save project
    cy.get("editor-wc").shadow().contains("Save").click();

    // Check receipt of an event to trigger a redirect to the remixed project URL
    cy.get("#project-identifier").should("not.have.text", originalIdentifier);
    cy.get("#project-identifier")
      .invoke("text")
      .then((remixIdentifier) => {
        // Check we're still seeing the changed code
        cy.get("editor-wc")
          .shadow()
          .find("[contenteditable]")
          .should("have.text", "# remixed!");

        // Visit the original project again
        cy.visit(urlFor(originalIdentifier));

        // Check we no longer see the changed code, i.e. `load_remix_disabled=true` is respected
        cy.get("editor-wc")
          .shadow()
          .find("[contenteditable]")
          .should("not.have.text", "# remixed!");

        // View the remixed project
        cy.visit(urlFor(remixIdentifier));

        // Check we're still seeing the changed code
        cy.get("editor-wc")
          .shadow()
          .find("[contenteditable]")
          .should("have.text", "# remixed!");
      });
  });
});

describe("when embedded, output_only & output_split_view are true", () => {
  const urlFor = (identifier) => {
    const params = new URLSearchParams();
    params.set("identifier", identifier);
    params.set("load_remix_disabled", "true");
    params.set("embedded", "true");
    params.set("output_only", "true");
    params.set("output_split_view", "true");
    return `${origin}?${params.toString()}`;
  };

  it("displays the embedded view for a Python project", () => {
    cy.visit(urlFor("clean-car-example"));

    // Check text output panel is visible and has a run button
    // Important to wait for this before making the negative assertions that follow
    const runnerContainer = cy
      .get("editor-wc")
      .shadow()
      .find(".proj-runner-container");
    runnerContainer
      .find(".react-tabs__tab--selected")
      .should("contain", "output.textOutput");
    cy.get("editor-wc")
      .shadow()
      .find("button")
      .contains("runButton.run")
      .should("not.be.disabled")
      .should("be.visible");

    // Check that the side bar is not displayed
    cy.get("editor-wc").shadow().contains("Project files").should("not.exist");
    // Check that the project bar is not displayed
    cy.get("editor-wc")
      .shadow()
      .contains("Don't Collide: Clean Car")
      .should("not.exist");
    // Check that the editor input containing the code is not displayed
    cy.get("editor-wc")
      .shadow()
      .contains("# The draw_obstacle function goes here")
      .should("not.exist");

    // Run the code and check it executed without error
    cy.get("editor-wc")
      .shadow()
      .find("button")
      .contains("runButton.run")
      .click();
    cy.get("#results").should("contain", '{"errorDetails":{}}');

    // Check that the visual output panel is displayed in split view mode (vs tabbed view)
    cy.get("editor-wc").shadow().contains("Visual output").should("be.visible");
    cy.get("editor-wc")
      .shadow()
      .contains("Visual output")
      .parents("ul")
      .children()
      .should("have.length", 1);
  });

  it("displays the embedded view for an HTML project", () => {
    cy.visit(urlFor("anime-expressions-solution"));

    // Check HTML preview output panel is visible and has a run button
    // Important to wait for this before making the negative assertions that follow
    cy.get("editor-wc")
      .shadow()
      .contains("index.html preview")
      .should("be.visible");
    cy.get("editor-wc")
      .shadow()
      .find("button")
      .contains("runButton.run")
      .should("not.be.disabled")
      .should("be.visible");

    // Check that the code has automatically run i.e. the HTML has been rendered
    cy.get("editor-wc")
      .shadow()
      .find("iframe#output-frame")
      .its("0.contentDocument.body")
      .should("contain", "Draw anime with me");

    // Check that the side bar is not displayed
    cy.get("editor-wc").shadow().contains("Project files").should("not.exist");
    // Check that the project bar is not displayed
    cy.get("editor-wc")
      .shadow()
      .contains("Anime expressions solution")
      .should("not.exist");
    // Check that the editor input containing the code is not displayed
    cy.get("editor-wc")
      .shadow()
      .contains("<h1>Draw anime with me</h1>")
      .should("not.exist");

    // Run the code and check it executed without error
    cy.get("editor-wc").shadow().find("button").contains("Run").click();
    cy.get("#results").should("contain", '{"errorDetails":{}}');
  });
});
