import {
  getEditorShadow,
  openSaveAndDownloadPanel,
} from "../helpers/editor.js";
import {
  assertScratchIsRendered,
  getScratchIframeBody,
} from "../helpers/scratch.js";

const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers["Origin"] = origin;
    req.continue();
  });
  cy.viewport(1400, 800);
});

describe("Scratch", () => {
  beforeEach(() => {
    cy.visit(origin);
    cy.findByText("cool-scratch").click();
  });

  it("loads Scratch in an iframe", () => {
    assertScratchIsRendered();
  });

  it("hides text size in settings for Scratch", () => {
    assertScratchIsRendered();

    getEditorShadow()
      .findByRole("button", { name: "Settings" })
      .first()
      .click();
    getEditorShadow()
      .find(".settings-panel__text-size")
      .should("exist")
      .and("not.be.visible");
  });

  it("can perform uploads and downloads of Scratch projects via the save and download panel", () => {
    assertScratchIsRendered();

    // confirm set up is different to loaded project and does not contain a sprite with this name
    getScratchIframeBody()
      .findByRole("button", { name: "test sprite" })
      .should("not.exist");

    const saveAndDownloadPanel = openSaveAndDownloadPanel();

    cy.readFile("cypress/fixtures/upload-test-project.sb3", {
      encoding: null,
    }).then((contents) => {
      expect(contents).to.be.instanceOf(ArrayBuffer);
    });

    // upload project
    saveAndDownloadPanel.uploadProject(
      "cypress/fixtures/upload-test-project.sb3",
    );

    // confirm project has been uploaded
    getScratchIframeBody()
      .findByRole("button", { name: "test sprite" }, { timeout: 30000 })
      .should("be.visible");

    cy.task("resetDownloads");

    saveAndDownloadPanel.downloadProject();

    // assert on the file
    cy.task("getNewestSb3").then((filePath) => {
      expect(filePath).to.be.a("string");
      expect(filePath).to.match(/\.sb3$/);

      cy.task("readSb3", filePath).then(({ fileNames, projectJson }) => {
        expect(fileNames).to.include("project.json");

        const spriteNames = projectJson.targets
          .filter((t) => t.isStage === false)
          .map((t) => t.name);

        expect(spriteNames).to.include("test sprite");
      });
    });
  });
});
