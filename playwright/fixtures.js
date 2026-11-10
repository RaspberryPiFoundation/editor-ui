import { test as base, expect } from "@playwright/test";

// Hosts serving Pyodide, its packages and PyPI wheels, which are immutable per URL.
const cacheableAssetHosts =
  /^https:\/\/(editor-assets\.raspberrypi\.org|pypi\.org|files\.pythonhosted\.org|cdn\.jsdelivr\.net)\//;

// Shared test fixture that restores the Cypress environment the existing specs were written against.
export const test = base.extend({
  // What `window.crossOriginIsolated` looks like to the app; PythonRunner uses Pyodide only when it is true. Set per spec with `test.use({ crossOriginIsolation })`:
  // - "off" (default): forced false. Cypress runs the app inside its runner iframe, which is not isolated, so it falls back to Skulpt; spec-wc's Skulpt assertions depend on that.
  // - "forced": forced true, as spec-wc-pyodide.cy.js does with `cy.window()`, so the app picks Pyodide although the page is not really isolated (--disable-web-security prevents it). SharedArrayBuffer still exists because of the --enable-features=SharedArrayBuffer launch flag.
  // The `realIsolation` project option (or PW_CROSS_ORIGIN_ISOLATED=1) skips the override and leaves the browser's real value.
  crossOriginIsolation: ["off", { option: true }],
  // Set by the chromium-isolated project, which launches without --disable-web-security so Vite's COOP/COEP headers really isolate the page.
  realIsolation: [false, { option: true }],

  // Experimental, opt in with PW_ASSET_CACHE=1. Each test gets a fresh browser context with an empty HTTP cache, so every test re-downloads Pyodide (about 6 MB, more with packages). This keeps successful GET responses from the asset hosts in memory for the life of the Playwright worker process and serves them to every context. Routing also disables the browser's HTTP cache for the context, which is why it covers whole hosts rather than single files.
  // eslint-disable-next-line no-empty-pattern -- Playwright requires a destructuring pattern for fixture dependencies.
  assetCache: [async ({}, use) => use(new Map()), { scope: "worker" }],

  context: async ({ context, assetCache }, use) => {
    if (process.env.PW_ASSET_CACHE) {
      await context.route(cacheableAssetHosts, async (route) => {
        const request = route.request();
        if (request.method() !== "GET") return route.continue();
        let cached = assetCache.get(request.url());
        if (!cached) {
          const response = await route.fetch();
          cached = {
            status: response.status(),
            headers: response.headers(),
            body: await response.body(),
          };
          if (response.status() === 200) assetCache.set(request.url(), cached);
        }
        await route.fulfill(cached);
      });
    }
    await use(context);
  },

  page: async ({ page, crossOriginIsolation, realIsolation }, use) => {
    if (!realIsolation && !process.env.PW_CROSS_ORIGIN_ISOLATED) {
      await page.addInitScript((value) => {
        Object.defineProperty(window, "crossOriginIsolated", {
          configurable: true,
          get: () => value,
        });
      }, crossOriginIsolation === "forced");
    }

    // Port of the Cypress `cy.intercept("*", ...)` in spec-wc and spec-wc-pyodide that forces an Origin header on every request. Off by default: the tests pass without it under Playwright (it looks like a workaround for Cypress's proxy), and routing every Vite dev module through it costs time. Enable with PW_ORIGIN_ROUTE=1.
    if (process.env.PW_ORIGIN_ROUTE) {
      await page.route("**/*", (route) =>
        route.continue({
          headers: {
            ...route.request().headers(),
            origin: "http://localhost:3011",
          },
        }),
      );
    }

    // Cypress fails a test on any uncaught page exception; Playwright does not by default.
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await use(page);

    expect(pageErrors, "uncaught exceptions in the page").toEqual([]);
  },
});

export { expect };
