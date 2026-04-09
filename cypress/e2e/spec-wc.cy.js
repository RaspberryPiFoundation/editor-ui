import {
  getCodeEditorInput,
  getEditorShadow,
  getRunButton,
  getSettingsPanel,
  getSidebar,
  getSkulptTabByName,
  getTextSizeSetting,
  openSettingsPanel,
  runProject,
  saveProject,
} from "../helpers/editor.js";

const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers.Origin = origin;
    req.continue();
  });
});

describe("default behaviour", () => {
  beforeEach(() => {
    cy.visit(origin);
  });

  it("renders the web component", () => {
    getRunButton().should("contain", "Run");
  });

  it("defaults to the text output tab", () => {
    getSkulptTabByName("Text output").should(
      "have.attr",
      "aria-selected",
      "true",
    );
  });

  it("does not render visual output tab on page load", () => {
    getEditorShadow().should("not.contain.text", "Visual output");
  });

  it("shows text size in settings for standard editor projects", () => {
    cy.findByText("blank-python-starter").click();

    getSidebar().should("exist");
    openSettingsPanel();
    getSettingsPanel().should("exist");
    getTextSizeSetting().should("be.visible");
  });
});

describe("when load_remix_disabled is true, e.g. in editor-standalone", () => {
  const authKey = "oidc.user:https://auth-v1.raspberrypi.org:editor-api";

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
    getCodeEditorInput().type("# remixed!");

    // Save project
    saveProject();

    // Check receipt of an event to trigger a redirect to the remixed project URL
    cy.get("#project-identifier").should("not.have.text", originalIdentifier);
    cy.get("#project-identifier")
      .invoke("text")
      .then((remixIdentifier) => {
        // Check we're still seeing the changed code
        getCodeEditorInput().should("have.text", "# remixed!");

        // Visit the original project again
        cy.visit(urlFor(originalIdentifier));

        // Check we no longer see the changed code, i.e. `load_remix_disabled=true` is respected
        getCodeEditorInput().should("not.have.text", "# remixed!");

        // View the remixed project
        cy.visit(urlFor(remixIdentifier));

        // Check we're still seeing the changed code
        getCodeEditorInput().should("have.text", "# remixed!");
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
    getSkulptTabByName("Text output").should(
      "have.attr",
      "aria-selected",
      "true",
    );
    getRunButton().should("not.be.disabled");
    getRunButton().should("be.visible");

    // Check that the side bar is not displayed
    getEditorShadow().should("not.contain.text", "Project files");
    // Check that the project bar is not displayed
    getEditorShadow().should("not.contain.text", "Don't Collide: Clean Car");
    // Check that the editor input containing the code is not displayed
    getEditorShadow().should(
      "not.contain.text",
      "# The draw_obstacle function goes here",
    );

    // Run the code and check it executed without error
    runProject();
    cy.get("#results").should("contain", '"errorDetails":{}');

    // Check that the visual output panel is displayed in split view mode (vs tabbed view)
    getSkulptTabByName("Visual output").should("be.visible");
    getSkulptTabByName("Visual output").should("have.length", 1);
  });
});
