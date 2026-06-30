# Vite migration notes

## Test runner scope

Keep Jest as the test runner for the initial Vite bundler migration.

Jest is already wired into local scripts, CI coverage reporting, React test
setup, CSS/SVG transforms, and worker mocks. Migrating to Vitest at the same
time would make bundler regressions harder to identify because test
infrastructure changes would be mixed with runtime build changes.

After the Vite build is deployed, Vitest can be evaluated as a separate change
with its own coverage and transform parity checks.
