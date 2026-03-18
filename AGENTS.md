# Project Overview
- Web component version of Raspberry Pi Code Editor, built with React and a
  custom (ejected CRA) webpack setup.
- Primary entry is the web component bundle served by the dev server at
  `http://localhost:3011`.

## Repository Structure
- `src/`: application code, redux, web component entrypoints.
- `public/`: static assets, Python/Skulpt libraries and shims.
- `cypress/`: end-to-end tests and fixtures.
- `config/`: webpack/jest config and build helpers.
- `.github/workflows/`: CI/CD and deploy pipelines.

## Quickstart Commands
```
yarn install
cp .env.example .env
yarn start
```

## Development Workflow
- Node.js: use the version pinned in `.tool-versions`.
- CI currently runs on Node 16, so avoid using Node APIs or syntax that are not supported in Node 16 until CI is updated or aligned.
- Yarn 4 is required (`packageManager` in `package.json`). If you don't have the right Yarn version available, run `corepack enable`. `npm install` can fail - use `yarn install` instead.
- Dev server: `yarn start` (webpack dev server on `http://localhost:3011`).
- Env vars live in `.env` (see `.env.example` for defaults).
- Build output goes to `build/` (gitignored).

## Testing & CI
- CI config: `.github/workflows/ci-cd.yml`.
- CI commands:
```
yarn install --immutable
yarn lint
yarn run test --coverage --maxWorkers=4 --workerThreads=true \
  --reporters=default --reporters=jest-junit --reporters=jest-github-actions-reporter
```
- Cypress in CI starts the app with `yarn start` and runs against
  `http://localhost:3011` with `REACT_APP_API_ENDPOINT`, `PUBLIC_URL`,
  `ASSETS_URL` env vars set.
- Local e2e:
```
yarn exec cypress run
# or
yarn exec cypress open
```
- Do not update `CHANGELOG.md`; use GitHub Releases as the source of truth for
  release notes.
- Stylelint exists (`yarn stylelint`) but is not enabled in CI.

## Code Style & Conventions
- EditorConfig: 2-space indent, LF, max line length 80, trim trailing whitespace.
- ESLint + Prettier (via ESLint) governs JS/JSX formatting.
- SCSS linting via Stylelint (`stylelint-use-logical` enabled).
- Web component uses Shadow DOM: new internal styles must be imported in
  `src/assets/stylesheets/InternalStyles.scss` (and external libs in
  `ExternalStyles.scss`); avoid `rem`, prefer `em` and `--scale-factor`.

## Translations / locale files
- Only update `public/translations/en.json` when adding or changing translation keys.
- Do not add or edit keys in other locale files under `public/translations/`; Crowdin sync overwrites them.
- Missing keys in non-en locales are intentional until Crowdin syncs; the app falls back to `en`. Do not suggest adding a new key to other locale files when it appears only in `en.json`.

## Git & Commit Guidance
- Write descriptive commit messages that explain why a change was made.
- When applicable, include alternatives considered and why they were not
  chosen.

## Security & Safety Guardrails
- Never commit secrets or real credentials; `.env`, `.env.webcomponent`, and their `*.local` variants are gitignored.
- Never commit generated output: `build/`, `coverage/`,
  `cypress/screenshots`, `cypress/videos`.
- Never edit `yarn.lock` by hand; use Yarn 4 to update deps. If a containerized
  update is required, use `scripts/with-builder.sh`.
- Never run deployment steps locally; deploys happen in GitHub Actions with
  AWS/Cloudflare secrets.

## Common Tasks (add feature, add test, refactor, release/deploy if applicable)
- **Add feature:** update `src/` components/hooks/redux and any affected assets;
  do not update `CHANGELOG.md`.
- **Add test:** unit tests live under `src/` as `*.test.js`;
  e2e tests live in `cypress/e2e`; run `yarn test` or `yarn exec cypress run`.
- **Refactor:** keep Shadow DOM styling constraints in mind; re-run `yarn lint`
  and `yarn test` after moving files or changing imports.
- **Release/deploy:** follow the release steps in `README.md` (bump
  `package.json` version, PR, tag release); do not update `CHANGELOG.md`.
  Deploys are driven by `.github/workflows/deploy.yml`.

### Running tests
- Unit tests: `CI=true yarn test` (without `CI=true`, Jest enters interactive watch mode which hangs).
- Lint: `yarn lint` (runs ESLint on `src/` and `cypress/`).
- Cypress e2e requires the dev server to be running first (`yarn start`).

## Further Reading (relative links)
- `README.md`
- `docs/WebComponent.md`
- `docs/HTML.md`
- `docs/PythonDependencies.md`
- `docs/Deployment.md`
- `.github/workflows/ci-cd.yml`

## Cursor Cloud specific instructions

### Service overview
This is a single-service frontend application (no backend, database, or Docker required).
The only service is the webpack dev server on port 3011, started with `yarn start`.

### Python execution caveat
The editor's Python runtime (Pyodide) requires external CDN access
(`cdn.jsdelivr.net`). In network-restricted cloud environments, Python code
execution will silently fail (no output). HTML/CSS/JS projects work fully
offline. This does not affect unit tests or linting.

### Dev server startup
`yarn start` takes ~15 seconds to compile. Wait for the
`webpack compiled successfully` message before curling or browsing port 3011.
The test page is served at port 3011 under path `/web-component.html`.
