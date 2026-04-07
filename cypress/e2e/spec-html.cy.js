import {
  clickHtmlRunnerPreviewLink,
  expectErrorModalToNotExist,
  expectHtmlRunnerPreviewToContainText,
  expectHtmlRunnerPreviewToNotContainText,
  getEditorShadow,
  getErrorModalTitle,
  getHtmlRunnerContainer,
  makeNewFile,
  runProject,
  setCodeEditorContent,
} from "../helpers/editor.js";
import { defaultHtmlProject } from "../../src/utils/defaultProjects";

const baseUrl =
  "http://localhost:3011/web-component.html?identifier=blank-html-starter";

beforeEach(() => {
  cy.intercept(
    "GET",
    `${Cypress.env(
      "REACT_APP_API_ENDPOINT",
    )}/api/projects/blank-html-starter?locale=en`,
    defaultHtmlProject,
  );

  localStorage.clear();
  cy.visit(baseUrl);
});

it("blocks access to localStorage authKey", () => {
  setCodeEditorContent(`<p>authKey: <span id="authKey"></span></p>
  <script>
    localStorage.setItem("authKey", "secret")
    const authKey = localStorage.getItem("authKey")
    document.getElementById("authKey").innerHTML = \`\${authKey}\`
  </script>`);

  runProject();

  expectHtmlRunnerPreviewToContainText("authKey: null");
});

it("blocks access to localStorage OIDC keys", () => {
  setCodeEditorContent(`<p>oidcUser: <span id="oidcUser"></span></p>
<script>
  localStorage.setItem("oidc.user:https://auth-v1.raspberrypi.org:editor-api", "token")
  const oidcUser = localStorage.getItem("oidc.user:https://auth-v1.raspberrypi.org:editor-api")
  document.getElementById("oidcUser").innerHTML = \`\${oidcUser}\`
</script>`);

  runProject();

  expectHtmlRunnerPreviewToContainText("oidcUser: null");
});

it("allows access to other localStorage keys", () => {
  setCodeEditorContent(`<p>foo: <span id="foo"></span></p>
<script>
  localStorage.setItem("foo", "bar")
  const foo = localStorage.getItem("foo")
  document.getElementById("foo").innerHTML = \`\${foo}\`
</script>`);

  runProject();

  expectHtmlRunnerPreviewToContainText("foo: bar");
});

it("renders the html runner", () => {
  runProject();
  getHtmlRunnerContainer().should("be.visible");
});

it("can make a new file", () => {
  makeNewFile("amazing.html");
  getEditorShadow()
    .findByRole("button", { name: "amazing.html" })
    .should("be.visible");
});

it("updates the preview after a change when you click run", () => {
  runProject();
  expectHtmlRunnerPreviewToNotContainText("hello world");

  setCodeEditorContent("<p>hello world</p>");
  runProject();

  expectHtmlRunnerPreviewToContainText("hello world");
});

it("blocks non-permitted external links", () => {
  setCodeEditorContent(
    '<a href="https://raspberrypi.org/en/">some external link</a>',
  );

  runProject();

  clickHtmlRunnerPreviewLink("some external link");
  getErrorModalTitle().should("be.visible");
});

it("allows permitted external links", () => {
  setCodeEditorContent(
    '<a href="https://rpf.io/seefood">some external link</a>',
  );

  runProject();

  clickHtmlRunnerPreviewLink("some external link");
  cy.url().should("eq", baseUrl);
  expectErrorModalToNotExist();
});

it("allows internal links", () => {
  setCodeEditorContent("<p>hello world</p>");
  runProject();

  makeNewFile();

  setCodeEditorContent('<a href="index.html">some internal link</a>');
  runProject();

  clickHtmlRunnerPreviewLink("some internal link");
  expectHtmlRunnerPreviewToContainText("hello world");
});
