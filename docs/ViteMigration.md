# Vite migration notes

## Build shape

Vite owns the dev server and production build. The migration preserves the
stable deployment entrypoints expected by host applications:

- `web-component.html` / `web-component.js`
- `html-renderer.html` / `html-renderer.js`
- `scratch.html` / `scratch.js`
- `PyodideWorker.js`

Scratch still uses the prebuilt Scratch GUI UMD bundle and React 18 vendor
globals inside its iframe. The Vite config bridges Scratch-only imports to
those globals so the main web component can keep its normal React bundle.

## Test runner scope

Keep Jest as the test runner for the initial Vite bundler migration.

Jest is already wired into local scripts, CI coverage reporting, React test
setup, CSS/SVG transforms, and worker mocks. Migrating to Vitest at the same
time would make bundler regressions harder to identify because test
infrastructure changes would be mixed with runtime build changes.

After the Vite build is deployed, Vitest can be evaluated as a separate change
with its own coverage and transform parity checks.
