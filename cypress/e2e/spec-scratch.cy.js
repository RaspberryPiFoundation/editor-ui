import {
  getEditorShadow,
  openSaveAndDownloadPanel,
} from "../helpers/editor.js";
import {
  assertScratchIsRendered,
  getScratchIframeBody,
} from "../helpers/scratch.js";

const origin = "http://localhost:3011/web-component.html";
const authKey = "oidc.user:https://auth-v1.raspberrypi.org:editor-api";
const user = {
  access_token: "dummy-access-token",
  profile: {
    user: "student-id",
  },
};

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
    saveAndDownloadPanel.uploadProject(
      "cypress/fixtures/upload-test-project.sb3",
    );

    // confirm project has been uploaded
    getScratchIframeBody()
      .findByRole("button", { name: "test sprite" })
      .should("be.visible");

    cy.task("resetDownloads");

    saveAndDownloadPanel.downloadProject();

    // assert on the file
    cy.task("getNewestDownload", ".sb3").then((filePath) => {
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

describe("Scratch save integration", () => {
  beforeEach(() => {
    cy.on("window:before:load", (win) => {
      win.localStorage.setItem(authKey, JSON.stringify(user));
    });

    const params = new URLSearchParams();
    params.set("auth_key", authKey);
    params.set("load_remix_disabled", "true");

    cy.visit(`${origin}?${params.toString()}`);
    cy.findByText("cool-scratch").click();
  });

  it("remixes on the first save, keeps the iframe project loaded, and saves after the identifier update", () => {
    getEditorShadow()
      .find("iframe[title='Scratch']")
      .its("0.contentDocument.body")
      .should("not.be.empty");

    getEditorShadow()
      .find("iframe[title='Scratch']")
      .should(($iframe) => {
        const url = new URL($iframe.attr("src"));
        expect(url.searchParams.get("project_id")).to.eq("cool-scratch.json");
      })
      .then(($iframe) => {
        cy.stub($iframe[0].contentWindow, "postMessage").as(
          "scratchPostMessage",
        );
      });

    getEditorShadow().findByRole("button", { name: "Save" }).click();

    cy.get("@scratchPostMessage")
      .its("firstCall.args.0")
      .should("deep.include", { type: "scratch-gui-remix" });

    cy.window().then((win) => {
      win.dispatchEvent(
        new win.MessageEvent("message", {
          origin: win.location.origin,
          data: {
            type: "scratch-gui-project-id-updated",
            projectId: "student-remix",
          },
        }),
      );
    });

    cy.get("#project-identifier").should("have.text", "student-remix");

    getEditorShadow()
      .find("iframe[title='Scratch']")
      .should(($iframe) => {
        const url = new URL($iframe.attr("src"));
        expect(url.searchParams.get("project_id")).to.eq("cool-scratch.json");
      });

    cy.get("@scratchPostMessage").then((postMessage) => {
      postMessage.resetHistory();
    });

    getEditorShadow().findByRole("button", { name: "Save" }).click();

    cy.get("@scratchPostMessage")
      .its("firstCall.args.0")
      .should("deep.include", { type: "scratch-gui-save" });
  });
});

describe("Scratch Authorization header", () => {
  const scratchProjectsApiMatcher = "**/api/scratch/projects/**";

  it("includes Authorization header when authKey and access token are present in localStorage", () => {
    cy.on("window:before:load", (win) => {
      win.localStorage.setItem(authKey, JSON.stringify(user));
    });

    const params = new URLSearchParams();
    params.set("auth_key", authKey);
    params.set("load_remix_disabled", "true");

    cy.intercept("GET", scratchProjectsApiMatcher).as("scratchProjectRequest");

    cy.visit(`${origin}?${params.toString()}`);
    cy.findByText("cool-scratch").click();

    cy.wait("@scratchProjectRequest")
      .its("request.headers")
      .then((headers) => {
        expect(headers.authorization).to.equal(user.access_token);
      });
  });

  it("does not include Authorization header when authKey is not present in localStorage", () => {
    cy.on("window:before:load", (win) => {
      win.localStorage.removeItem(authKey);
      win.localStorage.removeItem("authKey");
    });

    const params = new URLSearchParams();
    params.set("auth_key", authKey);
    params.set("load_remix_disabled", "true");

    cy.intercept("GET", scratchProjectsApiMatcher).as("scratchProjectRequest");

    cy.visit(`${origin}?${params.toString()}`);
    cy.findByText("cool-scratch").click();

    cy.wait("@scratchProjectRequest")
      .its("request.headers")
      .then((headers) => {
        expect(headers).to.not.have.property("authorization");
      });
  });
});
