import {
  dragEditorResizeHandle,
  dragSidebarResizeHandle,
  getEditorResizeHandle,
  getProjEditorContainer,
  getSidebarPanel,
  getSidebarResizeHandle,
  checkEditorInitialized,
} from "../helpers/editor.js";

const origin =
  "http://localhost:3011/web-component.html?project=blank-python-starter";

beforeEach(() => {
  cy.intercept("*", (req) => {
    req.headers.Origin = origin;
    req.continue();
  });
});

const visitAndLoadPythonProject = () => {
  cy.visit(origin);
  checkEditorInitialized();
  getProjEditorContainer().should("exist");
};

describe("layout resize", () => {
  it("resizes editor/output split on desktop", () => {
    cy.viewport(1280, 800);
    visitAndLoadPythonProject();

    getProjEditorContainer().then(($container) => {
      getEditorResizeHandle("verticalHandle").should(($handle) => {
        const containerRect = $container[0].getBoundingClientRect();
        const handleRect = $handle[0].getBoundingClientRect();

        expect(handleRect.width).to.equal(16);
        expect(handleRect.left).to.be.closeTo(containerRect.right + 3, 1);
      });
    });

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

    getProjEditorContainer().then(($container) => {
      getEditorResizeHandle("horizontalHandle").should(($handle) => {
        const containerRect = $container[0].getBoundingClientRect();
        const handleRect = $handle[0].getBoundingClientRect();

        expect(handleRect.height).to.equal(16);
        expect(handleRect.top).to.be.closeTo(containerRect.bottom + 3, 1);
      });
    });

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

    getSidebarPanel()
      .should("be.visible")
      .then(($panel) => {
        getSidebarResizeHandle().should(($handle) => {
          const panelRect = $panel[0].getBoundingClientRect();
          const handleRect = $handle[0].getBoundingClientRect();

          expect(handleRect.width).to.equal(16);
          expect(handleRect.left).to.be.closeTo(panelRect.right + 4, 0.5);
        });
      });

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
