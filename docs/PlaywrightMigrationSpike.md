# Playwright migration spike

Discovery spike on branch `investigate/playwright-migration`: `cypress/e2e/spec-wc.cy.js` ported to Playwright (`playwright/e2e/spec-wc.spec.js`) and benchmarked, plus a read-only inventory of the whole Cypress suite to estimate a full migration.

## Summary

- The port works: all 5 active tests pass in both tools, with no flakes across ~15 Playwright and ~8 Cypress runs.
- Playwright is roughly 2× faster single-worker and 3× faster with default workers on this spec, mostly by avoiding Cypress's ~5s startup. Per test it is not faster; see the caveat under Timings.
- A full migration is estimated at **6.5–9 dev-days**, dominated by `spec-scratch` and `spec-wc-pyodide`.
- The spike found one Cypress test that asserts nothing, and a CORS dependency hidden by `chromeWebSecurity: false`.
- **Pyodide spec (phase 2): go.** `spec-wc-pyodide` migrated in under a day. Worker request interception works natively, and a separate project runs Pyodide under real cross-origin isolation for the first time. There were no flakes. The port also exposed a real accessibility bug in the app's modals. Single-worker speed matches Cypress; the 4× gain comes only from parallel workers. See [Phase 2](#phase-2-spec-wc-pyodide).

## What was added

| File | Purpose |
|---|---|
| `playwright.config.js` | Chromium only, 1000×660 viewport (Cypress default), 10s expect timeout, 3 retries on CI, same Chrome flags as `cypress.config.mjs` plus `--disable-web-security`, `webServer` running `yarn start` with the CI env |
| `playwright/fixtures.js` | Extended `page` fixture: forces `crossOriginIsolated = false` and fails the test on any uncaught page error, both to match Cypress behaviour |
| `playwright/helpers/editor.js` | Port of the `cypress/helpers/editor.js` functions this spec uses |
| `playwright/e2e/spec-wc.spec.js` | The port, same test names and structure |
| `package.json` | `@playwright/test` ^1.64.1 and a `test:e2e:pw` script |

Run it with `yarn test:e2e:pw` (first run `yarn exec playwright install chromium`, about 99 MiB).

## Timings

`spec-wc` (5 tests), local Mac, server already warm, wall-clock seconds.

| Setup | Cypress | Playwright, 1 worker | Playwright, 6 workers |
|---|---|---|---|
| Dev server (`yarn start`) | 13.0 (12.0–13.8) | 6.4 (6.4–6.7) | 4.1 (3.9–4.4) |
| Built bundles (`build:all` + `preview:all`, as CI) | 7.0 | 4.9 | 2.6 |

- Cypress spends about 4.5–5s per run on startup outside the tests, plus about 5s warming up on the first test against the dev server. A cold run took 20.9s.
- Per test, Playwright is slower: about 0.6s on built bundles against Cypress's 0.1–0.2s. Playwright opens a fresh browser context, with an empty HTTP cache, for every test; Cypress keeps one browser.
- So on a larger spec Playwright's single-worker lead will shrink, and the real gain comes from parallel workers and CI sharding. Measuring a large spec (pyodide or skulpt) should be the first thing the full experiment does.

## Findings from the port

1. **Cross-origin isolation changes which Python runner is used.** Cypress runs the app inside its runner iframe, which is not cross-origin isolated, so `PythonRunner.jsx` picks Skulpt. Playwright loads the page top-level with Vite's COOP/COEP headers, so it is isolated and picks Pyodide. The fixture forces `crossOriginIsolated = false` to keep parity; set `PW_CROSS_ORIGIN_ISOLATED=1` to opt out. This also means that **neither suite currently tests Pyodide under real isolation**, which Playwright could do.
2. **The tests only pass with CORS disabled.** `test-editor-api.raspberrypi.org` sends no `Access-Control-Allow-Origin` header for `http://localhost:3011`, so project loads fail in a normal browser. Cypress hides this with `chromeWebSecurity: false`; the spike uses `--disable-web-security` to do the same. A narrower fix would be a `page.route` on the API host that adds the header, or an API-side CORS allowance for localhost.
3. **"does not render visual output tab on page load" asserts nothing in Cypress.** It runs before the shadow root has rendered, so `not.contain.text` passes against an empty tree. Once the app renders, the Skulpt runner always contains a hidden "Visual output" tab and the same assertion fails. The Playwright version waits for the Run button and then asserts there is no accessible "Visual output" tab. Other Cypress specs probably contain the same "negative assertion before render" pattern.
4. **Shadow DOM is simpler.** Playwright locators pierce open shadow roots, so `cy.get("editor-wc").shadow()` disappears. One catch: `toContainText` / `toHaveText` on the host element read only the light DOM, so negative text assertions need a `getByText(...)` count of 0 instead.
5. **The Origin-header rewrite is probably a Cypress leftover.** The `cy.intercept("*")` that rewrites the Origin header in every spec is not needed under Playwright. It is ported behind `PW_ORIGIN_ROUTE=1` and costs about 0.2s per run.
6. **Trivial translations.** `window:before:load` became `addInitScript`; `defaultCommandTimeout` became `expect.timeout`; the uncaught-exception failure became a `pageerror` guard; Testing Library queries became `getByRole`/`getByTestId`, with `exact: true` where Testing Library matched exact strings.

## Suite-wide inventory

8 specs, 1,533 lines, 91 tests. There are no custom commands: everything goes through `cypress/helpers/editor.js`, which is a clean seam to port.

| Spec | Tests | Effort | Main drivers |
|---|---|---|---|
| `spec-wc` | 5 | done | (this spike) |
| `spec-wc-block-to-text` | 1 | 0.1d | |
| `spec-wc-instructions` | 1 | 0.25d | Request-body assertions become `waitForRequest` |
| `spec-wc-resize` | 3 | 0.5d | Manual drag via `trigger` becomes `page.mouse`; geometry checks need re-tuning |
| `missionZero-wc` | 20 | 0.5d | Synthetic `window.blur()` / `focus()` semantics |
| `spec-wc-skulpt` | 17 | 0.75d | `crossOriginIsolated` overrides, uncaught-error handling |
| `spec-wc-pyodide` | 30 | done (<1d) | (phase 2) |
| `spec-scratch` | 14 | 1.5–2d | `cy.stub` on a cross-origin iframe's `postMessage`, downloads, autosave timing |
| Shared config, fixtures, CI, docs, lint | | 1.5–2d | |

**Risks, most severe first**

1. **Cross-origin isolation (finding 1).** It has to be decided per spec: keep parity with Cypress, or use the move to test Pyodide properly.
2. **Scratch `postMessage` stubbing.** `cy.stub` currently swallows the messages, so Scratch never really remixes or saves. Playwright has no equivalent on a cross-origin frame, and recording the messages instead would let real API calls through, so the test needs redesigning.
3. ~~**Intercepting worker requests.**~~ Resolved in phase 2: Playwright's routing intercepts the worker's synchronous XHR natively.
4. **External network plus fixed waits.** test-editor-api, editor-assets and PyPI are all hit live, and the suite has about 23s of `cy.wait(ms)` plus 3 retries. Expect some stabilisation work; `page.clock` can replace the autosave debounce wait.
5. **Lost implicit checks.** Cypress fails on uncaught exceptions, defaults to a 1000×660 viewport, and treats shadow-host text differently. The shared fixture must enforce the same behaviour or tests will pass silently (finding 3 shows this already happens).

**Easier in Playwright:** downloads (`waitForEvent("download")` replaces three `cy.task`s and the download-directory polling), hidden file inputs (`setInputFiles`), cross-origin iframes (`frameLocator`; no `chromeWebSecurity` hack needed for Scratch), and `@testing-library/cypress` / `cypress-real-events` can be dropped (`cypress-real-events` is imported but unused).

## CI and tooling impact

- **CI job:** replace `cypress-io/github-action` with `yarn exec playwright install --with-deps chromium`, cache `~/.cache/ms-playwright`, and use `webServer` for `preview:all` (3011 and 3014). Upload `playwright/test-results` and `playwright/report` on failure. Either keep the job id `test-cypress` or update `deploy-*` `needs:` and branch protection together.
- **Sharding:** `--shard` across a matrix is free, unlike Cypress Cloud.
- **Lint:** `yarn lint` does not cover `playwright/`; extend the glob and replace the `cy` / `Cypress` globals override in `.eslintrc.json`.
- **Docs:** `CLAUDE.md` says CI runs Cypress against `yarn start`, but CI actually uses `build:all` + `preview:all`; that line is already wrong. README, `scripts/claude-cloud-setup.sh` (`CYPRESS_INSTALL_BINARY=0`) and the `serveIndexAtRootForCypress` Vite plugin also need updating.
- **Claude Code cloud sessions:** not tested. Playwright has no proxy layer like Cypress's, so the `ECONNRESET` crash should not apply, but the browser download host and test-editor-api must be reachable through the sandbox proxy.

## Phase 2: spec-wc-pyodide

`cypress/e2e/spec-wc-pyodide.cy.js` (30 tests) ported to `playwright/e2e/spec-wc-pyodide.spec.js`, with test names kept 1:1. It runs in two Playwright projects:

- **`chromium`:** parity with Cypress. Uses `--disable-web-security` and `--enable-features=SharedArrayBuffer`, with `crossOriginIsolated` forced to true.
- **`chromium-isolated`:** no Chrome flags; the page is really cross-origin isolated through Vite's COOP/COEP headers. Each test asserts `crossOriginIsolated === true` and that `SharedArrayBuffer` exists.

### Results

| | Cypress | PW `chromium` | PW `chromium-isolated` |
|---|---|---|---|
| Passing | 30/30 | 28/30 | 28/30 |
| Flakes / retries | none in 4 runs | none in ~12 runs plus a 5× stress run of the network-heavy tests | same |

The two Playwright failures ("runs a program with multiple files" and "reloads imported local files between code runs") are deliberate soft assertions on an accessibility bug (finding 7). The Python behaviour in both tests passes.

### Timings

Local Mac, warm dev server, wall-clock seconds; Playwright's default here was 6 workers.

| Setup | 1 worker | Default workers |
|---|---|---|
| Cypress | 110 (108–112) | n/a |
| PW `chromium` | 115 (112–120) | 29 (28–30); 35 on a later re-run |
| PW `chromium-isolated` | 108 | 27; 34 on a later re-run |
| PW `chromium` + `PW_ASSET_CACHE=1` | 93 | 26–32 |

- **Single worker:** Playwright is no faster than Cypress. Each test pays about 2.5–3s for Pyodide boot in a fresh context, which uses up the roughly 20s saved by removing the fixed waits.
- **Parallel:** about 4× faster, and this is the only speed gain on heavy specs. On CI the same gain needs either a large runner or `--shard`.
- **Asset cache:** the opt-in in-memory cache of editor-assets, PyPI and jsDelivr saves about 19% on one worker and nothing with parallel workers, because each worker warms its own cache. It's off by default, but it may be worth trying on a slower CI network.

### Findings from the Pyodide port

1. **Worker request interception works.** urllib inside the worker becomes a synchronous XHR (`pyodide_http.patch_all()` in `src/PyodideWorker.js`). Both `page.route` and `context.route` intercept it, with or without isolation, so the Cypress stub ports 1:1 and no fallback server is needed. This was the biggest unknown.
2. **Real isolation works and is configurable per project.** `SharedArrayBuffer`, `input()` and interrupt all work without Chrome flags. This spec never calls test-editor-api, so it needs no CORS workaround. Isolation is set at launch, so it's a project-level setting, not a per-spec one. In parity mode, `SharedArrayBuffer` exists only because of the Chrome flag, and Cypress has the same hidden dependency.
3. **The fixed waits are gone.** The matplotlib, seaborn and plotly tests (5s, 12s and 3s) now wait for the `editor-runCompleted` payload that the test page writes to `#results`. This was 100% reliable in the stress runs. Seaborn now takes 7.7s, against 14–15s in Cypress.
4. **Another assertion that checks nothing.** The pie-chart test's "no error" check ran before the code had run, the same pattern as finding 3 for `spec-wc`. It is fixed by waiting for the run to complete.
5. **The UI is rendered twice.** Both the Skulpt and Pyodide runners are always in the DOM, and error messages appear in both, so Cypress's queries would pass even if the wrong runner ran. Playwright's strict mode caught the duplicates. Queries are now scoped to `pyodide-runner`, and an active-runner guard checks which runner is in use.
6. **Smaller items.** Pyodide plus PyPI needs a longer per-test timeout (`describe.configure({ timeout: 120_000 })`). `import.meta` doesn't work in specs because they compile to CommonJS, so the spec uses `__dirname`. `cy.intercept` with a fixture becomes `route.fulfill({ path })`.
7. **Accessibility bug in the app: modals hide themselves from screen readers.** `GeneralModal` and `ErrorModal` set react-modal's `appElement` to the `editor-wc` host, but the modal renders inside that host's shadow root. Opening a modal therefore sets `aria-hidden="true"` on the element that contains it. The subagent also reported that the attribute stays after the new-file modal closes, which would hide the whole editor; I haven't checked that part myself. Playwright's `getByRole` respects `aria-hidden` across the shadow boundary, while Testing Library inside Cypress does not, which is why Cypress never noticed. The fix is probably `appElement` pointing at a sibling inside the shadow root. It will affect every spec that opens a modal.

## Suggested next steps for the full experiment

1. Fix or explicitly accept the modal `aria-hidden` bug (finding 7). It's an app fix in its own right, separate from the migration.
2. Run the Playwright suite in a Claude Code cloud session to check it works behind the sandbox proxy.
3. Add a non-blocking Playwright CI job with `--shard` and compare its time and flake rate against `test-cypress`. Parallelism is the only real speed gain, so this is the measurement that matters.
4. Decide on the CORS approach (route stub or API allowance) before dropping `--disable-web-security` from the parity project.
5. Redesign the Scratch `postMessage` tests, rather than translating them line by line.
6. Run both suites side by side in CI for a while before removing Cypress.
