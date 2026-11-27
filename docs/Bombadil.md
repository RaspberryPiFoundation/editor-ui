# Bombadil (property-based UI testing)

[Bombadil](https://github.com/antithesishq/bombadil) explores the editor
on its own: it clicks, types, runs code, opens modals, switches projects and
so on. After every step it checks a set of _properties_, rules that should
always hold, such as "exactly one file tab is selected" or "pressing Run shows
the current code in the preview". When a property fails you get the exact
sequence of steps that led there. You can replay that sequence and inspect it
step by step.

Cypress checks scripted examples. Bombadil finds the sequences nobody thought
to script.

## Requirements

- macOS on Apple silicon, or Linux (x64 or arm64). There is no Intel Mac or
  native Windows build, so use WSL on Windows.
- Google Chrome or Chromium. Bombadil finds Chrome in the usual install
  locations or on your `PATH` (`google-chrome`, `chromium`, ...). To use a
  different binary, set `CHROME=/path/to/chrome`.
- Network access to `editor-assets.raspberrypi.org` if you want Python
  projects to run (Pyodide is loaded from there). HTML projects work offline.

The `bombadil` binary comes from the `@antithesishq/bombadil` dev
dependency, so `yarn install` is all the setup there is.

## Running it

```bash
yarn test:bombadil
```

This explores the `cool-html` sample project for 2 minutes in a headless
browser. If the dev server isn't already running on `http://localhost:3011`,
the script starts it (creating `.env` from `.env.example` if needed) and
stops it afterwards. Exploration moves between sample projects too, so every
fixture gets visited.

If a dev server is already running on that port, it is used as-is, even one
started from another checkout or worktree. The script logs when it does this.

Options are set with environment variables:

| Variable              | Default                 | Meaning                                       |
| --------------------- | ----------------------- | --------------------------------------------- |
| `BOMBADIL_PROJECT`    | `cool-html`             | Sample project to start on (`src/projects/`)  |
| `BOMBADIL_TIME_LIMIT` | `2m`                    | How long to explore: `30s`, `10m`, `1h`, ...  |
| `BOMBADIL_HEADED`     | unset                   | `1` opens a visible browser window to watch   |
| `BOMBADIL_SPEC`       | `bombadil/spec.ts`      | Specification file                            |
| `BOMBADIL_ORIGIN`     | `http://localhost:3011` | Dev server origin (see below)                 |

`BOMBADIL_ORIGIN` must be a `http://localhost:<port>` origin for the
script to start the server itself, using that port. For any origin other
than `http://localhost:3011` (including `http://127.0.0.1:3011`), the URLs in
`.env` (`PUBLIC_URL`, `ASSETS_URL`, `HTML_RENDERER_URL`) must use the same
origin, or the HTML preview checks fail. The script warns about this. A
non-local origin must already be serving the editor. `BOMBADIL_PROJECT` must
be the name of a file in `src/projects/`.

Other options go straight to `bombadil browser test`. The script itself sets
`--time-limit`, `--headless`, `--output-path` and `--reproduce`. To control
those yourself, run `yarn bombadil browser test` directly.

```bash
BOMBADIL_PROJECT=cool-python BOMBADIL_TIME_LIMIT=10m yarn test:bombadil
```

```bash
BOMBADIL_HEADED=1 yarn test:bombadil --exit-on-violation
```

The full CLI is available as `yarn bombadil` (try
`yarn bombadil browser test --help`).

## Reading the results

While it runs, Bombadil prints each action it takes. When a property fails,
it prints the property, the values it saw and the time it happened. The
exit code is `0` if nothing was violated, `2` if a property was violated, and
`1` if Bombadil itself failed, for example because of an error in the spec.
An invalid command-line option also exits with `2`, so check the output. Ctrl-C
stops the run, closes its Chrome, and still leaves a trace to inspect.

Every run writes to `bombadil-output/<project>-<timestamp>/` (gitignored).
That folder holds `trace.jsonl` (one line per state) and a screenshot per
state. At the end the script prints two commands:

```bash
yarn bombadil browser inspect bombadil-output/<run>
```

opens a web UI where you can step through the run. It shows the actions on
the left, a timeline with the violations marked, and before/after
screenshots and the extracted values for each step.

```bash
yarn bombadil browser test --headless --reproduce bombadil-output/<run> '<url>' bombadil/spec.ts
```

replays the same actions. Replays are best-effort: they fail if the app
behaves differently, for example because of timing.

## How the specification is organised

| File                  | What it covers                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `bombadil/spec.ts`    | Entry point: re-exports the properties and defines the weighted action mix                            |
| `bombadil/shell.ts`   | App mounts and doesn't crash, filtered console errors/exceptions, untranslated i18n keys              |
| `bombadil/editor.ts`  | File tabs and CodeMirror; actions that click and type into the editor                                 |
| `bombadil/runners.ts` | Run/Stop controls, HTML preview, Python runs; actions that write and run known programs               |
| `bombadil/sidebar.ts` | Sidebar panels, modals, file name validation, instructions; actions for modals and instructions       |
| `bombadil/host.ts`    | Host-page integration (changing the `locale` attribute)                                               |
| `bombadil/lib/`       | Shared DOM helpers and the "oracle" helper for checks done inside custom actions                      |

The spec uses Bombadil's default clicks (which reach inside the shadow
root), scrolling, back/forward/reload and waiting. Bombadil's default typing
only targets a focused `<input>`/`<textarea>` in the page itself, so it can't
type into CodeMirror, the file name modal or the instructions editor, which
are all inside `<editor-wc>`'s shadow root. Custom actions in the files above
fill that gap.

### Writing properties and actions

- Read the [specification language](https://antithesishq.github.io/bombadil/)
  docs first. The examples there are short.
- `extract(state => ...)` runs **in the page** on every state, with full DOM
  access. Get to the editor with `editorRoot(state.document)` from
  `lib/dom.ts`. Return small, JSON-serialisable values.
- Property thunks (`always(() => ...)`) run in Bombadil's own JS runtime,
  **not** the page. Use only plain JS there: no `document`, no `URL`. Work
  out anything that needs browser APIs in an extractor instead.
- Custom actions (`registerCustomAction`) run in the page and can be async.
  If a check is easier to write as "do X, wait, check Y" than as a temporal
  formula, do it in the action and call
  `recordFailure(window, "propertyName", detail)`. Then export
  `oracleProperty("propertyName")`. `runners.ts` uses this for Python and
  HTML runs.
- Only offer actions that a real user could perform in the current state.
  For example, don't click the preview while a modal overlay is covering it.
  `spec.ts` turns off every custom action except the dialog ones while a
  dialog is open. Gate new actions the same way.
- Relative imports need the `.ts` extension (`import ... from "./lib/dom.ts"`).
- A property must hold for a correct app. A property that fires on
  legitimate behaviour drowns out real bugs. Use `eventually(...).within(...)`
  for anything asynchronous.
- `bombadil/tsconfig.json` gives your editor the types. Bombadil bundles the
  TypeScript itself, so there's no build step.

## Known violations

These properties fail on `main` as of 2026-11-25. Each one was reproduced by
hand.

| Property                                                                    | What's wrong                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `localeSwitchKeepsUnsavedEdits` (also `editorDocReachesStore`, `fileTabsWellFormed`, `htmlPreviewShowsLatestCode`) | Changing the `locale` attribute on `<editor-wc>` resets the project to `initial_project` in the store, but CodeMirror keeps showing the user's edits. Run then executes the **original** code. If a non-main file was focused, the tab bar ends up with no selected tab and no editor. After the change, HTML Run stops updating the preview. Cause: `currentProjectMatchesRequest` in `src/hooks/useProject.js` is false for hosts that pass `initial_project` without `identifier`, so the "keep local edits" early return is skipped. |
| `activeEditorMatchesSelectedTab`                                            | Closing the focused file tab leaves CodeMirror showing the closed file under the next tab, and new typing goes into the closed file. The `EditorView` is only rebuilt when the theme or font size changes (`EditorPanel.jsx`), and tab panels are keyed by index. Renaming the focused file has the same cause. The run and locale actions skip this state so it isn't blamed on them.            |
| `htmlPreviewStaysInsideRenderer` (in-page anchor)                           | Clicking `<a href="#target">` in an HTML project's preview loads `html-renderer.html` *inside* the preview instead of scrolling. In a `srcdoc` iframe a bare fragment resolves against the parent's URL.                                                                                                              |
| `htmlPreviewStaysInsideRenderer` (lookalike link)                           | The "allowed external link" check in `src/utils/externalLinkHelper.js` is `new RegExp("^" + PUBLIC_URL)`: a raw prefix match with unescaped dots. Locally, `http://localhost:3011@example.com/` (host `example.com`) is treated as allowed and loaded into the output frame. In production `PUBLIC_URL` includes a path, so the `@` trick doesn't apply, but each `.` matches any character, so a lookalike host with `-` in place of a dot passes. A safer check compares `new URL(link).origin` with the editor's origin before checking the path. |
| `htmlPreviewShowsLatestCode` (after an allowed link)                        | After following any allowed link in the preview, the output frame stays on that page and later Runs never show the project's output again.                                                                                                                                                                             |
| `openModalNotHiddenFromAT`                                                  | react-modal's `appElement` is `<editor-wc>`, so opening any modal sets `aria-hidden="true"` on the element that contains the dialog. The dialog is hidden from screen readers.                                                                                                                                         |
| `noUntranslatedI18nKeysVisible`                                             | `projectTypes.code_editor_scratch` is missing from `en.json`, so the Projects panel for Scratch projects shows the raw key.                                                                                                                                                                                         |
| `noAppUncaughtExceptions`                                                   | Astro Pi: "Reset model" before the 3D model has loaded throws `Cannot read properties of undefined (reading 'rotation')` (`window.rotatemodel` in `src/utils/Orientation.js` doesn't check `window.mod`).                                                                                                             |
| `noAppConsoleErrors`                                                        | React warning from `<details open="true">` in `src/components/Editor/ErrorMessage/ErrorMessage.jsx` (should be `open`).                                                                                                                                                                                                |

On the dev server, closing a modal also leaves `aria-hidden="true"` on
`<editor-wc>`. That's caused by React StrictMode's double mount and doesn't
happen without StrictMode, so there's deliberately no property for it.

## Version

The dependency is pinned to an exact version because Bombadil is pre-1.0 and
releases include breaking changes. It's 0.7.10 because `.yarnrc.yml` has
`npmMinimalAgeGate: 7d` and 0.8.0 was too new when this was set up. When
upgrading to 0.8.x, note that `--output-path` becomes a file path rather than
a directory, so `scripts/bombadil.sh` needs updating.

Bombadil isn't run in CI. To add it, use
[bombadil-action](https://github.com/antithesishq/bombadil-action).
