const code = `
from p5 import *

img = None

def preload():
    global img
    img = load_image("moon.png")

def setup():
    size(400, 200)

def draw():
    fill("green")
    text_size(100)
    text("PASS", 125, 110)
    image(img, 10, 25, 100 , 100)
    no_loop()

run()
`;

const params = new URLSearchParams();
params.set("assets_identifier", "encoded-art-starter");
params.set("host_styles", JSON.stringify("#wc { min-height: 200px }"));
params.set("code", code);
params.set("output_only", true);
params.set("output_panels", JSON.stringify(["visual"]));

const baseUrl = `http://localhost:3011/web-component.html?${params.toString()}`;

it("runs p5 sketch including image loaded from project ", () => {
  cy.visit(baseUrl);

  cy.get("editor-wc").shadow().find(".embedded-viewer").should("exist");
  cy.get("editor-wc").shadow().find(".proj").should("not.exist");

  cy.get("button").contains("Run code").click();

  cy.get("#results").should("contain", '"errorDetails":{}');
});
