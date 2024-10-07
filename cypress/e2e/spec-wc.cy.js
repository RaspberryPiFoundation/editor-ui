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

  it("runs p5 code", () => {
    const code = `from p5 import *\n\ndef setup():\n    size(400, 400)  # width and height of screen\n\ndef draw():\n    fill('cyan')  # Set the fill color for the sky to cyan\n    rect(0, 0, 400, 250)  # Draw a rectangle for the sky with these values for x, y, width, height    \n  \nrun(frame_rate=2)\n`;
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", code);
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().find(".p5Canvas").should("exist");
  });

  it.only("Interrupts py5 draws when stop button clicked", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke(
        "text",
        "import py5\ndef setup():\n\tpy5.size(400, 400)\ndef draw():\n\tpy5.background(255)\npy5.run_sketch()",
      );
    cy.wait(10000);
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.wait(1000);
    cy.get("editor-wc").shadow().find(".btn--stop").click();
    cy.get("editor-wc")
      .shadow()
      .find(".error-message__content")
      .should("contain", "Execution interrupted");
  });

  it("Py5 magic comment imports py5", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "# Py5: imported mode");
    cy.get(".btn--run").click();

    cy.get(".p5Canvas").should("be.visible");
  });

  it("Py5 imported mode runs sketch without explicit run call", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke(
        "text",
        '# Py5: imported mode\ndef setup():\n\tsize(400,400)\n\ndef draw():\n\tprint("hello world")',
      );
    cy.get(".btn--run").click();

    cy.get(".pythonrunner-console-output-line").should(
      "contain",
      "hello world",
    );
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
    cy.get("editor-wc")
      .shadow()
      .find("#root")
      .should("contain", "Visual output");
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
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import p5");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().contains("Visual output").click();
    cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw");
  });

  it("does not render astro pi component if sense hat unimported", () => {
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import sense_hat");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc")
      .shadow()
      .find("div[class=cm-content]")
      .invoke("text", "import p5");
    cy.get("editor-wc").shadow().find(".btn--run").click();
    cy.get("editor-wc").shadow().contains("Visual output").click();
    cy.get("editor-wc").shadow().find("#root").should("not.contain", "yaw");
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

  it("loads the original project in preference to the remixed version", () => {
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
    cy.get("editor-wc").shadow().contains("Text output").should("be.visible");
    cy.get("editor-wc")
      .shadow()
      .find("button")
      .contains("Run")
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
    cy.get("editor-wc").shadow().find("button").contains("Run").click();
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
      .contains("Run")
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
