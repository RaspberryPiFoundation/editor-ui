import { defaultHtmlProject } from "../../src/utils/defaultProjects";

const baseUrl =
  "http://localhost:3011/web-component.html?identifier=blank-html-starter";

const getIframeDocument = () => {
  return cy
    .get("editor-wc")
    .shadow()
    .find("iframe[class=htmlrunner-iframe]")
    .its("0.contentDocument")
    .should("exist");
};

const getIframeBody = () => {
  const iframeDocument = getIframeDocument();
  return iframeDocument.its("body").should("not.be.null").then(cy.wrap);
};

const makeNewFile = (filename = "new.html") => {
  cy.get("editor-wc").shadow().find("span").contains("Add file").click();
  cy.get("editor-wc")
    .shadow()
    .find("div[class=modal-content__input]")
    .find("input")
    .type(filename);
  cy.get("editor-wc")
    .shadow()
    .find("div[class=modal-content__buttons]")
    .contains("Add file")
    .click();
};

beforeEach(() => {
  // intercept request to editor api
  cy.intercept(
    "GET",
    `${Cypress.env(
      "REACT_APP_API_ENDPOINT",
    )}/api/projects/blank-html-starter?locale=en`,
    defaultHtmlProject,
  );
});

it("blocks access to localStorage authKey", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      `<p>authKey: <span id="authKey"></span></p>
<script>
  localStorage.setItem("authKey", "secret")
  const authKey = localStorage.getItem("authKey")
  document.getElementById("authKey").innerHTML = \`\${authKey}\`
</script>`,
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  getIframeBody().find("p").should("include.text", "authKey: null");
});

it("blocks access to localStorage OIDC keys", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      `<p>oidcUser: <span id="oidcUser"></span></p>
<script>
  localStorage.setItem("oidc.user:https://auth-v1.raspberrypi.org:editor-api", "token")
  const oidcUser = localStorage.getItem("oidc.user:https://auth-v1.raspberrypi.org:editor-api")
  document.getElementById("oidcUser").innerHTML = \`\${oidcUser}\`
</script>`,
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  getIframeBody().find("p").should("include.text", "oidcUser: null");
});

it("allows access to other localStorage keys", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      `<p>foo: <span id="foo"></span></p>
<script>
  localStorage.setItem("foo", "bar")
  const foo = localStorage.getItem("foo")
  document.getElementById("foo").innerHTML = \`\${foo}\`
</script>`,
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  getIframeBody().find("p").should("include.text", "foo: bar");
});

it("renders the html runner", () => {
  cy.visit(baseUrl);
  cy.get("editor-wc").shadow().find(".btn--run").click();
  cy.get("editor-wc")
    .shadow()
    .find(".htmlrunner-container")
    .should("be.visible");
});

it("can make a new file", () => {
  cy.visit(baseUrl);
  makeNewFile("amazing.html");
  cy.get("editor-wc")
    .shadow()
    .find(".files-list-item")
    .should("include.text", "amazing.html");
});

it("updates the preview after a change when you click run", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  cy.get("editor-wc").shadow().find(".btn--run").click();
  getIframeBody().should("not.include.text", "hello world");
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", "<p>hello world</p>");
  cy.get("editor-wc").shadow().find(".btn--run").click();
  getIframeBody().find("p").should("include.text", "hello world");
});

it("blocks non-permitted external links", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke(
      "text",
      '<a href="https://raspberrypi.org/en/">some external link</a>',
    );
  cy.get("editor-wc").shadow().find(".btn--run").click();
  getIframeBody().find("a").click();
  cy.get("editor-wc")
    .shadow()
    .find("div[class=modal-content__header]")
    .find("h2")
    .should("include.text", "An error has occurred");
});

it("allows permitted external links", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", '<a href="https://rpf.io/seefood">some external link</a>');
  cy.get("editor-wc").shadow().find(".btn--run").click();
  const externalLink = getIframeBody().find("a");
  externalLink.click();
  cy.url().should("be.equals", baseUrl);
  cy.get("editor-wc")
    .shadow()
    .find("div[class=modal-content__header]")
    .should("not.exist");
});

it("allows internal links", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", "<p>hello world</p>");
  cy.get("editor-wc").shadow().find(".btn--run").click();
  makeNewFile();
  cy.get("editor-wc")
    .shadow()
    .find("div[class=cm-content]")
    .invoke("text", '<a href="index.html">some internal link</a>');
  cy.get("editor-wc").shadow().find(".btn--run").click();

  const internalLink = getIframeBody().find("a");
  internalLink.click();
  const content = getIframeBody().find("p");
  content.should("include.text", "hello world");
});
