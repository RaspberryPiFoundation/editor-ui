const baseUrl = "localhost:3000/en/projects/blank-html-starter";

const getIframeDocument = () => {
  return cy
    .get("iframe[class=htmlrunner-iframe]")
    .its("0.contentDocument")
    .should("exist");
};

const getIframeBody = () => {
  return getIframeDocument()
    .its("body")
    .should("not.be.undefined")
    .then(cy.wrap);
};

const makeNewFile = (filename = "new.html") => {
  cy.get("div[class=file-pane]").contains("Add file").click();
  cy.get("div[class=modal-content__input]").find("input").type(filename);
  cy.get("div[class=modal-content__buttons]").contains("Add file").click();
};

it("renders the html runner", () => {
  cy.visit(baseUrl);
  cy.get(".htmlrunner-container").should("be.visible");
});

it("can make a new file", () => {
  cy.visit(baseUrl);
  cy.get(".htmlrunner-container").should("be.visible");
});

it("updates the preview after a change when you click run", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  getIframeBody().should("not.include.text", "hello world");
  cy.get("div[class=cm-content]").invoke("text", "<p>hello world</p>");
  cy.get(".btn--run").click()
  getIframeBody().find("p").should("include.text", "hello world");
});

it("blocks external links", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  cy.get("div[class=cm-content]").invoke(
    "text",
    '<a href="https://raspberrypi.org/en/">some external link</a>'
  );
  cy.get(".btn--run").click()
  getIframeBody().find("a").click();
  cy.get("div[class=modal-content__header]")
    .find("h2")
    .should("include.text", "An error has occurred");
});

it("allows internal links", () => {
  localStorage.clear();
  cy.visit(baseUrl);
  cy.get("div[class=cm-content]").invoke("text", "<p>hello world</p>");
  cy.get(".btn--run").click()
  makeNewFile();
  cy.get("div[class=cm-content]").invoke(
    "text",
    '<a href="index.html">some internal link</a>'
  );
  cy.get(".btn--run").click()
 
  const internalLink = getIframeBody().find("a")
  internalLink.click();
  const content = getIframeBody().find("p")
  content.should("include.text", "hello world");
});
