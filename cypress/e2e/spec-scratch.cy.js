import {
  getEditorShadow,
  openSaveAndDownloadPanel,
} from "../helpers/editor.js";
import {
  assertScratchIsRendered,
  getScratchIframeBody,
} from "../helpers/scratch.js";

const origin = "http://localhost:3011/web-component.html";
const scratchFrameOrigin = Cypress.env("REACT_APP_SCRATCH_FRAME_URL");
const authKey = "oidc.user:https://auth-v1.raspberrypi.org:editor-api";
const user = {
  access_token: "dummy-access-token",
  profile: {
    user: "student-id",
  },
};

const scratchProjectURL = (params) => {
  const urlParams = new URLSearchParams(params);
  urlParams.set("project", "cool-scratch");
  return `${origin}?${urlParams.toString()}`;
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
    cy.visit(scratchProjectURL());
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

describe("Scratch locale", () => {
  [
    ["ga-IE", "Cód"],
    ["es-LA", "Código"],
    ["fr-FR", "Sons"],
  ].forEach(([locale, translatedTab]) => {
    it(`uses ${locale} selected by the host application`, () => {
      cy.visit(scratchProjectURL({ locale }));

      getScratchIframeBody()
        .findByRole("tab", { name: translatedTab })
        .should("be.visible");
      getScratchIframeBody()
        .findByRole("button", { name: /teapot/ })
        .should("be.visible");
    });
  });

  it("falls back to English when Scratch does not support the locale", () => {
    cy.visit(scratchProjectURL({ locale: "vls-BE" }));

    getScratchIframeBody()
      .findByRole("tab", { name: "Code" })
      .should("be.visible");
    getScratchIframeBody()
      .findByRole("button", { name: /teapot/ })
      .should("be.visible");
  });
});

describe("Scratch save integration", () => {
  beforeEach(() => {
    cy.on("window:before:load", (win) => {
      win.localStorage.setItem(authKey, JSON.stringify(user));
    });

    cy.visit(
      scratchProjectURL({ auth_key: authKey, load_remix_disabled: "true" }),
    );
  });

  it("remixes on the first save, keeps the iframe project loaded, and auto-saves after the identifier update", () => {
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
          origin: scratchFrameOrigin,
          data: {
            type: "scratch-gui-project-id-updated",
            projectId: "student-remix",
          },
        }),
      );
      win.dispatchEvent(
        new win.MessageEvent("message", {
          origin: scratchFrameOrigin,
          data: {
            type: "scratch-gui-remixing-succeeded",
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

    getEditorShadow()
      .find("button")
      .should(($buttons) => {
        const buttonText = [...$buttons].map((button) =>
          button.textContent.trim(),
        );
        expect(buttonText).not.to.include("Save");
      });

    cy.window().then((win) => {
      win.dispatchEvent(
        new win.MessageEvent("message", {
          origin: scratchFrameOrigin,
          data: {
            type: "scratch-gui-project-changed",
          },
        }),
      );
    });

    cy.wait(2100);

    cy.get("@scratchPostMessage").should((postMessage) => {
      const saveMessage = postMessage
        .getCalls()
        .some((call) => call.args[0]?.type === "scratch-gui-save");

      expect(saveMessage).to.eq(true);
    });
  });
});

describe("Scratch Authorization header", () => {
  const scratchProjectsApiMatcher = "**/api/scratch/projects/**";
  const remixApiMatcher = "**/api/projects/*/remix";

  it("includes Authorization header when authKey and access token are present in localStorage", () => {
    cy.on("window:before:load", (win) => {
      win.localStorage.setItem(authKey, JSON.stringify(user));
    });

    cy.intercept("GET", scratchProjectsApiMatcher).as("scratchProjectRequest");

    cy.visit(
      scratchProjectURL({ auth_key: authKey, load_remix_disabled: "true" }),
    );

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
    params.set("load_remix_disabled", "true");

    cy.intercept("GET", scratchProjectsApiMatcher).as("scratchProjectRequest");

    cy.visit(scratchProjectURL({ load_remix_disabled: "true" }));

    cy.wait("@scratchProjectRequest")
      .its("request.headers")
      .then((headers) => {
        expect(headers).to.not.have.property("authorization");
      });
  });

  it("includes Authorization header on load remix request when remix is enabled", () => {
    cy.on("window:before:load", (win) => {
      win.localStorage.setItem(authKey, JSON.stringify(user));
    });

    cy.intercept("GET", remixApiMatcher, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          identifier: "student-remix",
          project_type: "code_editor_scratch",
          name: "Student Remix",
          components: [],
          image_list: [],
        },
      });
    }).as("loadRemixRequest");

    cy.visit(
      scratchProjectURL({ auth_key: authKey, identifier: "cool-scratch.json" }),
    );

    cy.wait("@loadRemixRequest")
      .its("request.headers")
      .then((headers) => {
        expect(headers.authorization).to.equal(user.access_token);
      });
  });
});
