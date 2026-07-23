import {
  dragEditorResizeHandle,
  dragSidebarResizeHandle,
  getEditorResizeHandle,
  getProjEditorContainer,
  getSidebarPanel,
  loadPythonStarterProject,
} from "../helpers/editor.js";

const origin = "http://localhost:3011/web-component.html";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers.Origin = origin;
    req.continue();
  });
});

const visitAndLoadPythonProject = () => {
  cy.visit(origin);
  loadPythonStarterProject();
  getProjEditorContainer().should("exist");
};

describe("layout resize", () => {
  it("resizes editor/output split on desktop", () => {
    cy.viewport(1280, 800);
    visitAndLoadPythonProject();

    getEditorResizeHandle("verticalHandle").should("exist");

    let initialWidth;
    getProjEditorContainer().then(($el) => {
      initialWidth = $el[0].getBoundingClientRect().width;
    });

    return dragEditorResizeHandle("verticalHandle", { deltaX: -100 }).then(() =>
      getProjEditorContainer().should(($el) => {
        const nextWidth = $el[0].getBoundingClientRect().width;
        expect(nextWidth).to.be.lessThan(initialWidth);
      }),
    );
  });

  it("resizes editor/output split on stacked layout", () => {
    // 700px is deliberately between two layout breakpoints:
    // - Wider than 600px: still uses the desktop editor (with resize handles).
    // - Narrower than 720px in the project area: editor sits above output, with a
    //   horizontal drag bar between them (not side-by-side).
    cy.viewport(700, 900);
    visitAndLoadPythonProject();

    getEditorResizeHandle("horizontalHandle").should("exist");

    let initialHeight;
    getProjEditorContainer().then(($el) => {
      initialHeight = $el[0].getBoundingClientRect().height;
    });

    return dragEditorResizeHandle("horizontalHandle", { deltaY: 80 }).then(() =>
      getProjEditorContainer().should(($el) => {
        const nextHeight = $el[0].getBoundingClientRect().height;
        expect(nextHeight).not.to.equal(initialHeight);
      }),
    );
  });

  it("resizes sidebar file panel on desktop", () => {
    cy.viewport(1280, 800);
    visitAndLoadPythonProject();

    getSidebarPanel().should("be.visible");

    let initialWidth;
    getSidebarPanel().then(($el) => {
      initialWidth = $el[0].getBoundingClientRect().width;
    });

    return dragSidebarResizeHandle({ deltaX: 80 }).then(() =>
      getSidebarPanel().should(($el) => {
        const nextWidth = $el[0].getBoundingClientRect().width;
        expect(nextWidth).to.be.greaterThan(initialWidth);
      }),
    );
  });
});
