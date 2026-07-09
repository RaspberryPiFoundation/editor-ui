# Linking a local scratch-editor (Scratch GUI)

When you are working on the [Raspberry Pi Foundation scratch-editor](https://github.com/RaspberryPiFoundation/scratch-editor) fork (for example changes to `scratch-gui`), you may want editor-ui to load that build instead of the `@RaspberryPiFoundation/scratch-gui` version from GitHub Packages.

**Use the `code-classroom` branch** in scratch-editor as your base for editor-ui work. That branch is the integration line for this editor (RPF packaging, publish, and GUI props such as `libraryAssetUrlTemplate`). Check it out before you link or build:

```bash
cd ../scratch-editor
git fetch origin
git checkout code-classroom
```

Feature work should branch from `code-classroom`, not from upstream `main` or `code-classroom-base`.

editor-ui does not bundle Scratch GUI into the main webpack app. It copies a prebuilt `dist/scratch-gui.js` (and static assets) from `node_modules` into the dev server output. Pointing the dependency at your local clone is enough to test GUI changes in the Scratch iframe.

**Do not commit these linking changes.** They are temporary for local development only. These changes to `package.json`, `yarn.lock`, and `docker-compose.yml` are for local development only.

## Repository layout

Clone both repositories as siblings:

```text
Development/
  editor-ui/
  scratch-editor/    ← github.com/RaspberryPiFoundation/scratch-editor
```

## Temporary changes in editor-ui

**1. `apps/scratch-frame/package.json`** — replace the GitHub Packages dependency with a file link (the name must match the package in scratch-editor):

```json
"@RaspberryPiFoundation/scratch-gui": "file:../../../scratch-editor/packages/scratch-gui"
```

**2. `docker-compose.yml`** — mount the scratch-editor repo into the container (read-only):

```yaml
volumes:
  - .:/app
  - ../scratch-editor:/scratch-editor:ro
  - node_modules:/app/node_modules
```

From `/app` in the container, `file:../scratch-editor/packages/scratch-gui` resolves to `/scratch-editor/packages/scratch-gui` on the mounted volume.

**3. `yarn.lock`** — run `yarn install` inside Docker (see below) and commit nothing; the lockfile will change while the link is active. Revert it when you restore the GitHub Packages version in `package.json`.

## Build scratch-gui

Build on your machine (the `scratch-editor` mount is read-only inside the editor-ui container):

```bash
cd ../scratch-editor
nvm install
nvm use
NODE_ENV=development npm ci
npm run build
```

After every scratch-gui code change, run the build again, then restart the editor-ui container so webpack copies the new `dist/scratch-gui.js`.

## Run with Docker

**editor-api** (Scratch projects and assets API):

```bash
cd ../editor-api
docker compose up
```

**editor-ui**:

```bash
cd ../editor-ui
docker compose up
```

The container runs `yarn install` then `yarn start` on each start. The first start after switching to the file link may take longer while dependencies are linked.

## Verify in the browser

- Web component test page: open a **Scratch** sample, e.g.
  `http://localhost:3011/web-component.html`
  then choose **cool-scratch**.
- **editor-standalone** (port **3012**): also loads the web component from `http://localhost:3011`; open a Scratch project under `/en-US/projects/…` with editor-ui and editor-api running.

## Revert when finished

1. Restore the GitHub Packages pin in `apps/scratch-frame/package.json`, for example:

   ```json
   "@RaspberryPiFoundation/scratch-gui": "13.7.3-code-classroom.20260522151700"
   ```

   Use the version your branch pins (see [scratch-gui on GitHub Packages](https://github.com/RaspberryPiFoundation/scratch-editor/pkgs/npm/scratch-gui)).
2. Remove the `../scratch-editor:/scratch-editor:ro` volume from `docker-compose.yml`.
3. Revert `yarn.lock` (e.g. `git checkout -- yarn.lock`) or run `yarn install` again after restoring `package.json`.
4. Restart `docker compose up` in editor-ui.

