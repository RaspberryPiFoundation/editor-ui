import { defineConfig, devices } from "@playwright/test";

// Mirrors the env the `test-cypress` CI job sets, so the dev server talks to the same API and serves assets from the same origin.
const ciEnv = {
  REACT_APP_API_ENDPOINT: "https://test-editor-api.raspberrypi.org",
  PUBLIC_URL: "http://localhost:3011",
  ASSETS_URL: "http://localhost:3011",
  REACT_APP_ALLOWED_IFRAME_ORIGINS: "http://localhost:3011",
  CSP_API_MULTIPLE_ORIGINS: "http://localhost:3011,http://localhost:3009",
  REACT_APP_SCRATCH_FRAME_URL: "http://localhost:3014",
};

export default defineConfig({
  testDir: "./playwright/e2e",
  outputDir: "./playwright/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Cypress runMode retries are 3; keep parity so flake behaviour is comparable.
  retries: process.env.CI ? 3 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright/report" }]]
    : "list",
  // Cypress defaultCommandTimeout is 10s.
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3011",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Cypress default viewport, so responsive breakpoints match.
        viewport: { width: 1000, height: 660 },
        launchOptions: {
          // Same flags cypress.config.mjs pushes for Chrome, plus --disable-web-security as the equivalent of Cypress `chromeWebSecurity: false`: test-editor-api sends no Access-Control-Allow-Origin for http://localhost:3011, so project loads only work with CORS disabled.
          args: [
            "--disable-web-security",
            "--enable-features=SharedArrayBuffer",
            "--disable-site-isolation-trials",
            "--enable-unsafe-swiftshader",
          ],
        },
      },
    },
    {
      // Real cross-origin isolation: no --disable-web-security, so Vite's COOP/COEP headers apply and the app picks Pyodide without any override. Only the Pyodide spec runs here: it never calls test-editor-api, so it needs no CORS workaround.
      name: "chromium-isolated",
      testMatch: /spec-wc-pyodide\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1000, height: 660 },
        realIsolation: true,
        launchOptions: {
          // No --enable-features=SharedArrayBuffer either: under real isolation SharedArrayBuffer must be available without it.
          args: [
            "--disable-site-isolation-trials",
            "--enable-unsafe-swiftshader",
          ],
        },
      },
    },
  ],
  webServer: {
    command: "yarn start",
    url: "http://localhost:3011/web-component.html",
    reuseExistingServer: !process.env.CI,
    env: ciEnv,
    timeout: 60_000,
  },
});
