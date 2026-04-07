import {
  getFilesListItems,
  getHtmlRunnerContainer,
  getIframeBody,
  getModalHeader,
  getModalHeaderTitle,
  makeNewFile,
  runProject,
  setCodeEditorContent,
} from "../helpers/editor.js";
import { defaultHtmlProject } from "../../src/utils/defaultProjects";

const baseUrl =
  "http://localhost:3011/web-component.html?identifier=blank-html-starter";

beforeEach(() => {
  localStorage.clear();
  cy.visit(baseUrl);

  cy.intercept(
    "GET",
    `${Cypress.env(
      "REACT_APP_API_ENDPOINT",
    )}/api/projects/blank-html-starter?locale=en`,
    defaultHtmlProject,
  );
});

it("blocks access to localStorage authKey", () => {
  setCodeEditorContent(`<p>authKey: <span id="authKey"></span></p>
  <script>
    localStorage.setItem("authKey", "secret")
    const authKey = localStorage.getItem("authKey")
    document.getElementById("authKey").innerHTML = \`\${authKey}\`
  </script>`);

  runProject();

  getIframeBody().find("p").should("include.text", "authKey: null");
});

it("blocks access to localStorage OIDC keys", () => {
  setCodeEditorContent(`<p>oidcUser: <span id="oidcUser"></span></p>
<script>
  localStorage.setItem("oidc.user:https://auth-v1.raspberrypi.org:editor-api", "token")
  const oidcUser = localStorage.getItem("oidc.user:https://auth-v1.raspberrypi.org:editor-api")
  document.getElementById("oidcUser").innerHTML = \`\${oidcUser}\`
</script>`);

  runProject();

  getIframeBody().find("p").should("include.text", "oidcUser: null");
});

it("allows access to other localStorage keys", () => {
  setCodeEditorContent(`<p>foo: <span id="foo"></span></p>
<script>
  localStorage.setItem("foo", "bar")
  const foo = localStorage.getItem("foo")
  document.getElementById("foo").innerHTML = \`\${foo}\`
</script>`);

  runProject();

  getIframeBody().find("p").should("include.text", "foo: bar");
});

it("renders the html runner", () => {
  cy.visit(baseUrl);
  runProject();
  getHtmlRunnerContainer().should("be.visible");
});

it("can make a new file", () => {
  cy.visit(baseUrl);
  makeNewFile("amazing.html");
  getFilesListItems().should("include.text", "amazing.html");
});

it("updates the preview after a change when you click run", () => {
  runProject();
  getIframeBody().should("not.include.text", "hello world");

  setCodeEditorContent("<p>hello world</p>");
  runProject();

  getIframeBody().find("p").should("include.text", "hello world");
});

it("blocks non-permitted external links", () => {
  setCodeEditorContent(
    '<a href="https://raspberrypi.org/en/">some external link</a>',
  );

  runProject();

  getIframeBody().find("a").click();
  getModalHeaderTitle().should("include.text", "An error has occurred");
});

it("allows permitted external links", () => {
  setCodeEditorContent(
    '<a href="https://rpf.io/seefood">some external link</a>',
  );

  runProject();

  getIframeBody().find("a").click();
  cy.url().should("be.equals", baseUrl);
  getModalHeader().should("not.exist");
});

it("allows internal links", () => {
  setCodeEditorContent("<p>hello world</p>");
  runProject();

  makeNewFile();

  setCodeEditorContent('<a href="index.html">some internal link</a>');
  runProject();

  getIframeBody().find("a").click();
  getIframeBody().should("contain.text", "hello world");
});
