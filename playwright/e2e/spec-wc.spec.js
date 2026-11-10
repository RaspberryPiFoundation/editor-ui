import { test, expect } from "../fixtures.js";
import {
  getCodeEditorInput,
  getEditorShadow,
  getResults,
  getRunButton,
  getSettingsPanel,
  getSidebar,
  getSkulptTabByName,
  getTextSizeSetting,
  openSettingsPanel,
  runProject,
  saveProject,
} from "../helpers/editor.js";

const origin = "http://localhost:3011";

// Text inside the shadow root. Locator text assertions on the host element read the light-DOM textContent, which excludes the shadow tree, so assert on shadow-piercing text matches instead.
const shadowText = (page, text) => getEditorShadow(page).getByText(text);

test.describe("default behaviour", () => {
  const urlFor = (params) => {
    const urlParams = new URLSearchParams(params);
    return `${origin}/web-component.html?${urlParams.toString()}`;
  };

  test.beforeEach(async ({ page }) => {
    await page.goto(urlFor());
  });

  test("renders the web component", async ({ page }) => {
    await expect(getRunButton(page)).toContainText("Run");
  });

  test("defaults to the text output tab", async ({ page }) => {
    await expect(getSkulptTabByName(page, "Text output")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("does not render visual output tab on page load", async ({ page }) => {
    // Not a literal port. Cypress's `getEditorShadow().should("not.contain.text", "Visual output")` passes vacuously: it runs while the shadow root is still empty. Once rendered, the Skulpt runner always contains a `display: none` "Visual output" tab, so the literal assertion fails whenever the app has actually rendered. Assert the intent instead: after render, no accessible (i.e. displayed) Visual output tab.
    await expect(getRunButton(page)).toBeVisible();
    await expect(
      getEditorShadow(page).getByRole("tab", { name: "Visual output" }),
    ).toHaveCount(0);
  });

  test("shows text size in settings for standard editor projects", async ({
    page,
  }) => {
    await expect(getSidebar(page)).toHaveCount(1);
    await openSettingsPanel(page);
    await expect(getSettingsPanel(page)).toHaveCount(1);
    await expect(getTextSizeSetting(page)).toBeVisible();
  });
});

test.describe("when load_remix_disabled is true, e.g. in editor-standalone", () => {
  const authKey = "oidc.user:https://auth-v1.raspberrypi.org:editor-api";

  const user = { access_token: "dummy-access-token" };
  const originalIdentifier = "blank-python-starter";

  const urlFor = (identifier) => {
    const params = new URLSearchParams();
    params.set("auth_key", authKey);
    params.set("identifier", identifier);
    params.set("load_remix_disabled", "true");
    return `${origin}/web-component.html?${params.toString()}`;
  };

  test.beforeEach(async ({ page }) => {
    // Equivalent of cy.on("window:before:load"): runs before page scripts on every navigation.
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [authKey, JSON.stringify(user)],
    );
  });

  test.skip("loads the original project in preference to the remixed version", async ({
    page,
  }) => {
    const projectIdentifier = page.locator("#project-identifier");

    // View the original project
    await page.goto(urlFor(originalIdentifier));
    await expect(projectIdentifier).toHaveText(originalIdentifier);

    // Edit code
    await getCodeEditorInput(page).click();
    await page.keyboard.type("# remixed!");

    // Save project
    await saveProject(page);

    // Check receipt of an event to trigger a redirect to the remixed project URL
    await expect(projectIdentifier).not.toHaveText(originalIdentifier);
    const remixIdentifier = await projectIdentifier.textContent();

    // Check we're still seeing the changed code
    await expect(getCodeEditorInput(page)).toHaveText("# remixed!");

    // Visit the original project again
    await page.goto(urlFor(originalIdentifier));

    // Check we no longer see the changed code, i.e. `load_remix_disabled=true` is respected
    await expect(getCodeEditorInput(page)).not.toHaveText("# remixed!");

    // View the remixed project
    await page.goto(urlFor(remixIdentifier));

    // Check we're still seeing the changed code
    await expect(getCodeEditorInput(page)).toHaveText("# remixed!");
  });
});

test.describe("when embedded, output_only & output_split_view are true", () => {
  const urlFor = (identifier) => {
    const params = new URLSearchParams();
    params.set("identifier", identifier);
    params.set("load_remix_disabled", "true");
    params.set("embedded", "true");
    params.set("output_only", "true");
    params.set("output_split_view", "true");
    return `${origin}/web-component.html?${params.toString()}`;
  };

  test("displays the embedded view for a Python project", async ({ page }) => {
    await page.goto(urlFor("clean-car-example"));

    // Check text output panel is visible and has a run button
    // Important to wait for this before making the negative assertions that follow
    await expect(getSkulptTabByName(page, "Text output")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(getRunButton(page)).toBeEnabled();
    await expect(getRunButton(page)).toBeVisible();

    // Check that the side bar is not displayed
    await expect(shadowText(page, "Project files")).toHaveCount(0);
    // Check that the project bar is not displayed
    await expect(shadowText(page, "Don't Collide: Clean Car")).toHaveCount(0);
    // Check that the editor input containing the code is not displayed
    await expect(
      shadowText(page, "# The draw_obstacle function goes here"),
    ).toHaveCount(0);

    // Run the code and check it executed without error
    await runProject(page);
    await expect(getResults(page)).toContainText('"errorDetails":{}');

    // Check that the visual output panel is displayed in split view mode (vs tabbed view)
    await expect(getSkulptTabByName(page, "Visual output")).toBeVisible();
    await expect(getSkulptTabByName(page, "Visual output")).toHaveCount(1);
  });
});
