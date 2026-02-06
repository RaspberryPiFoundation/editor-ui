# Project Overview
- Web component version of Raspberry Pi Code Editor, built with React and a
  custom (ejected CRA) webpack setup.
- Primary entry is the web component bundle served by the dev server at
  `http://localhost:3011`.

## Repository Structure
- `src/`: application code, redux, web component entrypoints.
- `public/`: static assets, Python/Skulpt libraries and shims.
- `cypress/`: end-to-end tests and fixtures.
- `storybook/`: separate Storybook package with its own deps and config.
- `config/`: webpack/jest config and build helpers.
- `.github/workflows/`: CI/CD and deploy pipelines.

## Quickstart Commands
```
yarn install
cp .env.example .env
yarn start
```

## Development Workflow
- Node.js: use v18.17.1 locally (as pinned in `.tool-versions`). CI currently runs on Node 16, so avoid using Node APIs or syntax that are not supported in Node 16 until CI is updated or aligned.
- Yarn 3 is required (`packageManager` in `package.json`); `npm install` can fail - use `yarn install` instead.
- Dev server: `yarn start` (webpack dev server on `http://localhost:3011`).
- Env vars live in `.env` (see `.env.example` for defaults).
- Storybook (separate package, served at `http://localhost:6006/storybook/`):
```
yarn storybook
```
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
- `CHANGELOG.md` must be updated for PRs.
- Stylelint exists (`yarn stylelint`) but is not enabled in CI.

## Code Style & Conventions
- EditorConfig: 2-space indent, LF, max line length 80, trim trailing whitespace.
- ESLint + Prettier (via ESLint) governs JS/JSX formatting.
- SCSS linting via Stylelint (`stylelint-use-logical` enabled).
- Web component uses Shadow DOM: new internal styles must be imported in
  `src/assets/stylesheets/InternalStyles.scss` (and external libs in
  `ExternalStyles.scss`); avoid `rem`, prefer `em` and `--scale-factor`.
- Storybook stories live under `storybook/stories` and can import from `src/`
  using the configured module path.

## Security & Safety Guardrails
- Never commit secrets or real credentials; `.env`, `.env.webcomponent`, and their `*.local` variants are gitignored.
- Never commit generated output: `build/`, `coverage/`, `public/storybook`,
  `cypress/screenshots`, `cypress/videos`.
- Never edit `yarn.lock` by hand; use Yarn 3 to update deps. If a containerized
  update is required, use `scripts/with-builder.sh`.
- Never run deployment steps locally; deploys happen in GitHub Actions with
  AWS/Cloudflare secrets.

## Common Tasks (add feature, add test, refactor, release/deploy if applicable)
- **Add feature:** update `src/` components/hooks/redux and any affected assets;
  ensure `CHANGELOG.md` reflects user-visible changes.
- **Add test:** unit tests live under `src/**/__tests__` or `*.test.js`;
  e2e tests live in `cypress/e2e`; run `yarn test` or `yarn exec cypress run`.
- **Refactor:** keep Shadow DOM styling constraints in mind; re-run `yarn lint`
  and `yarn test` after moving files or changing imports.
- **Release/deploy:** follow the release steps in `README.md` (update
  `CHANGELOG.md`, bump `package.json` version, PR, tag release); deploys are
  driven by `.github/workflows/deploy.yml`.

## Further Reading (relative links)
- `README.md`
- `docs/WebComponent.md`
- `docs/HTML.md`
- `docs/PythonDependencies.md`
- `docs/Deployment.md`
- `storybook/README.md`
- `.github/workflows/ci-cd.yml`
