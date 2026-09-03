import {
  getAddStepButton,
  getEditorShadow,
  getInstructionsEditTextarea,
} from "../helpers/editor.js";

const origin = "http://localhost:3011/web-component.html";
const authKey = "oidc.user:https://auth-v1.raspberrypi.org:editor-api";
const userId = "cd8a5b3d-f7bb-425e-908f-1386decd6bb1";
const user = {
  access_token: "dummy-access-token",
  profile: { user: userId },
};
const projectIdentifier = "editable-instructions-project";
const projectApiMatcher = `**/api/projects/${projectIdentifier}*`;

const originalSteps = [
  { markdown_content: "Step one content" },
  { markdown_content: "Step two content" },
];

const fixtureProject = {
  identifier: projectIdentifier,
  name: "Editable instructions project",
  project_type: "python",
  user_id: userId,
  instructions: originalSteps,
  components: [{ name: "main", extension: "py", content: "" }],
  image_list: [],
};

const urlFor = (identifier) => {
  const params = new URLSearchParams();
  params.set("auth_key", authKey);
  params.set("identifier", identifier);
  params.set("editable_instructions", "true");
  params.set("load_remix_disabled", "true");
  return `${origin}?${params.toString()}`;
};

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers.Origin = origin;
    req.continue();
  });

  cy.on("window:before:load", (win) => {
    win.localStorage.setItem(authKey, JSON.stringify(user));
  });

  cy.intercept("GET", projectApiMatcher, {
    statusCode: 200,
    body: fixtureProject,
  }).as("loadProject");

  cy.intercept("PUT", projectApiMatcher, (req) => {
    req.reply({ statusCode: 200, body: req.body.project });
  }).as("saveProject");
});

describe("editing multi-step instructions", () => {
  it("posts the new step in the right position, alongside the existing steps", () => {
    cy.visit(urlFor(projectIdentifier));
    cy.wait("@loadProject");

    getInstructionsEditTextarea().should("have.value", "Step one content");

    getAddStepButton().click();

    getInstructionsEditTextarea()
      .should("have.value", "## Step title")
      .clear()
      .type("New step content");

    cy.wait("@saveProject", { timeout: 15000 })
      .its("request.body.project.instructions")
      .should("deep.equal", [
        { markdown_content: "Step one content" },
        { markdown_content: "New step content" },
        { markdown_content: "Step two content" },
      ]);
  });
});

describe("rendering mirrored instruction images", () => {
  const sourceUrl =
    "https://drive.google.com/thumbnail?id=1zWq7qCaoszwG_KnRl0UdFhYhV-B2FYQg";
  const mirroredUrl =
    "https://editor-assets.raspberrypi.org/instructions-assets/1zWq7qCaoszwG_KnRl0UdFhYhV-B2FYQg";

  it("loads a Google Drive thumbnail from the CORP-enabled asset bucket", () => {
    cy.intercept("GET", mirroredUrl, {
      statusCode: 200,
      headers: {
        "content-type": "image/svg+xml",
        "cross-origin-resource-policy": "cross-origin",
      },
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="purple"/></svg>',
    }).as("loadInstructionImage");

    cy.intercept("GET", projectApiMatcher, {
      statusCode: 200,
      body: {
        ...fixtureProject,
        instructions: [
          { markdown_content: `![Instruction diagram](${sourceUrl})` },
        ],
      },
    }).as("loadProjectWithImage");

    cy.visit(urlFor(projectIdentifier));
    cy.wait("@loadProjectWithImage");

    getEditorShadow().findByRole("tab", { name: "View" }).click();
    cy.wait("@loadInstructionImage")
      .its("response.headers")
      .should("include", { "cross-origin-resource-policy": "cross-origin" });
    getEditorShadow()
      .findByRole("img", { name: "Instruction diagram" })
      .should("have.attr", "src", mirroredUrl)
      .should(($image) => {
        expect($image[0].naturalWidth).to.be.greaterThan(0);
      });
  });
});
