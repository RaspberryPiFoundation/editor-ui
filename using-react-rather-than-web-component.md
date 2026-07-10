# Using React Rather Than Web Component

**Related issue:** [digital-editor-issues #1501](https://github.com/RaspberryPiFoundation/digital-editor-issues/issues/1501) — feedback panel / cross-boundary React integration; this spike explores replacing `<editor-wc>` with a direct `<Editor />` import as a longer-term fix.

This document describes a **proof-of-concept spike**, not a full production implementation. The goal is to get something working locally that demonstrates the basic idea — `editor-standalone` importing `<Editor />` directly instead of embedding `<editor-wc>` — so we can judge whether that direction is worth pursuing. Expect shortcuts, missing polish, and follow-up work before anything could ship.

## Local spike setup (`feedback-spike-branch-2`)

This spike replaces **all** `<editor-wc>` usage in `editor-standalone` with a direct React import of `<Editor />` from `@raspberrypifoundation/editor-ui`. It does **not** maintain the web component wrapper — that is out of scope for this spike.

Serving runtime content from `editor-standalone` is also out of scope — for example HTML preview iframes (`html-renderer.html`), the Pyodide worker, scratch-frame (`scratch.html`), translations, and shims. **For the purposes of this spike, those continue to be served from `editor-ui` domains** (ports 3011 and 3014 via Docker `editor-ui-assets`), not from the classroom app on :3013.

### Branches

| Repo | Branch |
|---|---|
| `editor-ui` | `feedback-spike-branch-2` |
| `editor-standalone` | `feedback-spike-branch-2` |

### One-time setup

From the `Development` folder (sibling checkouts):

```bash
# 1. Check out the spike branches in both repos
cd editor-ui && git checkout feedback-spike-branch-2
cd ../editor-standalone && git checkout feedback-spike-branch-2

# 2. Configure standalone .env (copy from .env.example if needed)
#    REACT_APP_EDITOR_UI_ASSETS_URL='http://localhost:3011'
#    REACT_APP_SCRATCH_FRAME_URL='http://localhost:3014'

# 3. Build and start from editor-standalone only
docker compose build
docker compose up classroom
```

#### What you do **not** need with Docker

| Step | Needed? | Why |
|---|---|---|
| `docker compose up` in `editor-ui` | **No** | `editor-standalone/docker-compose.yml` includes an `editor-ui-assets` service (ports 3011 and 3014) |
| Host `yarn install` in `editor-ui` | **No** | Containers run `yarn install` in `/editor-ui` on startup |
| Host `yarn install` in `editor-standalone` | **No** | Containers run `yarn install` in `/app` on startup |
| `yarn build` in `editor-ui` | **No** | Dev server compiles assets on the fly — see [Architecture](#architecture-two-bundles-three-ports) |

You only need both repos checked out as siblings; all install/start steps happen inside `editor-standalone` Docker Compose.

`editor-standalone/package.json` links the package locally:

```json
"@raspberrypifoundation/editor-ui": "link:../editor-ui"
```

`editor-ui` exposes the React API from `src/react-entry.js` (`package.json` sets `"main"` and `"exports"` to that file):

```js
import { Editor } from "@raspberrypifoundation/editor-ui";
```

`editor-standalone/craco.config.js` transpiles `editor-ui/src` (via `EDITOR_UI_ROOT` / `/editor-ui` in Docker), includes its SCSS in the build, removes CRA's `ModuleScopePlugin` (so the linked package can be resolved), and sets `fullySpecified: false` on webpack rules so editor-ui dependencies resolve correctly.

### Starting with Docker

Requires `editor-ui` and `editor-standalone` as **sibling directories** (e.g. both under `Development/`).

From `editor-standalone`:

```bash
docker compose build
docker compose up classroom   # classroom only
# or
docker compose up             # classroom + editor + editor-ui assets
```

`docker-compose.yml` sets up:

| Service | Port | Role |
|---|---|---|
| `editor-ui-assets` | 3011, 3014 | Serves runtime HTTP assets (3011) and scratch-frame (3014) via `yarn start:all` |
| `classroom` | 3013 | Code Classroom dev server |
| `editor` | 3012 | Code Editor dev server (optional) |

The standalone containers mount the linked library into the container:

```yaml
../editor-ui:/editor-ui   # yarn link:../editor-ui resolves to /editor-ui from /app
```

`EDITOR_UI_ROOT=/editor-ui` is set so webpack transpiles the mounted source. A shared `editor_ui_node_modules` volume holds `editor-ui` dependencies inside Docker.

`editor-ui-assets` starts first (healthcheck waits for `PyodideWorker.js` on port 3011). Standalone containers then run `yarn install` in both `/editor-ui` and `/app` before starting.

Configure `editor-standalone/.env` as usual (copy from `.env.example`). The browser loads assets from the host-mapped ports:

```
REACT_APP_EDITOR_UI_ASSETS_URL='http://localhost:3011'
REACT_APP_SCRATCH_FRAME_URL='http://localhost:3014'
```

Open [http://classroom.localhost:3013](http://classroom.localhost:3013) (API/auth stack as usual for local CEfE). Editor app: [http://localhost:3012](http://localhost:3012).

Confirm asset endpoints load: [http://localhost:3011/PyodideWorker.js](http://localhost:3011/PyodideWorker.js), [http://localhost:3011/html-renderer.html](http://localhost:3011/html-renderer.html), [http://localhost:3014/scratch.html](http://localhost:3014/scratch.html).

If private npm packages are needed for `editor-ui`, set `NPM_AUTH_TOKEN` in your environment before `docker compose up` (same as the existing `editor-ui` Docker setup).

### Architecture: two bundles, three ports

| What | Spike behaviour |
|---|---|
| **React UI** (`<Editor />`, sidebar, feedback) | Bundled by `editor-standalone` (:3013) via yarn link + craco |
| **Runtime assets** (Pyodide, html-renderer, translations, shims, copydecks) | HTTP from `editor-ui-assets` (:3011) — not in the React bundle |
| **Scratch / blocks** | iframe from scratch-frame (:3014) |

```text
classroom :3013  (standalone — React shell)
  ├── iframe → :3011/html-renderer.html   (HTML preview)
  ├── worker → :3011/PyodideWorker.js     (Python)
  └── iframe → :3014/scratch.html         (blocks)
```

Skulpt’s interpreter is bundled; only its shims load from :3011. HTML preview and Scratch use `postMessage` across origins today — same-domain deploy would simplify env/config but iframes and message contracts would likely stay for isolation.

**Spike shortcut:** Docker `editor-ui-assets` runs `yarn start:all` (3011 + 3014). Not a production model.

### What changed

| Area | Change |
|---|---|
| `editor-ui` | `<Editor />` export (`react-entry.js`); works without shadow DOM |
| `editor-standalone` | `Project`, `SchoolProject`, `EmbeddedViewer` use `<Editor />`; feedback via `sidebarPlugins` |
| `docker-compose.yml` | Mounts linked `editor-ui`; `editor-ui-assets` on 3011/3014 |
| Removed | `pluginsHelper.js`, `setSidebarPlugins`, portal-based feedback |

**Success:** projects load; sidebar + feedback work; run Python/HTML/blocks; no cross-React errors.

**If assets 404:** check `REACT_APP_EDITOR_UI_ASSETS_URL` / `REACT_APP_SCRATCH_FRAME_URL` in `.env` (defaults `3011` / `3014`). Verify PyodideWorker, html-renderer, and scratch.html URLs in the browser.

---

## Spike findings & follow-up

### Why move from `<editor-wc>`?

Today standalone loads `web-component.js`, renders `<editor-wc>`, and glues classroom UI via attributes, `setSidebarPlugins`, custom events, and portals. That gives **two React runtimes**, an unsafe plugin contract (React objects crossing the boundary), shadow DOM friction, and duplicated Redux.

**Proposed:** `import { Editor } from "@raspberrypifoundation/editor-ui"` — one React tree, normal composition (e.g. feedback as `sidebarPlugins` props), typed props instead of imperative APIs.

### Production follow-up (out of spike scope)

| Concern | Spike | Target |
|---|---|---|
| React UI | Standalone bundle | Same |
| Assets on :3011 | `editor-ui` dev server | Standalone build or CDN — **same origin** as classroom |
| Scratch on :3014 | scratch-frame dev server | Same host (e.g. `/scratch.html`) — largest packaging effort |

Rough work: copy or build assets into standalone’s deploy; point env vars (`REACT_APP_EDITOR_UI_ASSETS_URL`, `HTML_RENDERER_URL`, `ASSETS_URL`, `REACT_APP_SCRATCH_FRAME_URL`) at classroom’s URL; replicate COOP/COEP/CORP headers for Pyodide; keep a separate asset pipeline for external `editor-wc` embeds if maintained.

Same-origin helps asset loading and `postMessage` origin matching; it does **not** remove iframes (student HTML / scratch isolation) or the message APIs.

### `editor-wc` for external consumers — decide explicitly

Moving standalone to React does **not** decide the fate of script-tag embeds (Mission Zero, etc.).

| Option | Meaning |
|---|---|
| **Maintain** | Thin adapter: `web-component.js` renders shared `<Editor />`; attributes/events mapped in adapter layer only |
| **Deprecate** | npm `<Editor />` only; non-React embedders need another path |

Before wider rollout: inventory external consumers → product decision → maintain adapter or publish migration/sunset plan.

### State ownership

React import does not merge Redux automatically. **Recommended first step:** standalone owns state; `Editor` is controlled via props/callbacks. Deeper store unification is optional later work.

### Remaining `editor-wc` assumptions in `editor-ui`

Some paths still query `editor-wc` / shadow DOM (modals, scratch iframe, runners). Spike defers full cleanup; production needs container refs/context instead.

### Phases

| Phase | Status |
|---|---|
| **1 — Local spike** | Done on `feedback-spike-branch-2` (see setup above) |
| **2 — `editor-wc` decision** | Inventory + sign-off on maintain vs deprecate |
| **3 — Rollout** | Expand `<Editor />` usage; package runtime assets on one origin; execute external-consumer plan |
