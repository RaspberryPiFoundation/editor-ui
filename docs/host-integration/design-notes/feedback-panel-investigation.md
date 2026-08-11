# Feedback Panel Investigation

> **Design notes** from the feedback-panel investigation (also drafted in
> [editor-ui#1538](https://github.com/RaspberryPiFoundation/editor-ui/pull/1538)).
> They explain *why* we moved to serialisable plugin config and DOM slots.
>
> For the current host API, see
> [Sidebar plugins](../SidebarPlugins.md).

## Summary

The classroom feedback panel is injected from `editor-standalone` into
`editor-ui` via `<editor-wc>` (`setSidebarPlugins`). At the time of this
investigation, the plugin contract passed React components, functions, and
JSX from standalone's React bundle into `editor-ui`, which then rendered them
in its own React tree (**React slots** - unsafe across separate React
bundles).

That broke when standalone moved to React 19 while editor-ui was still on
React 18. Aligning versions fixed the crash, but the pattern remained risky.

The safe pattern is **DOM slots** (empty mount `<div>`s owned by editor-ui)
plus host portals into those nodes. Serialisable config crosses the web
component boundary; React does not.

Two spikes explored fixes: Alternative 1a (DOM slots - shipped) and
Alternative 4 (React `<Editor />` import - explored only).

## Code spikes

| Spike | Outcome | Links |
|---|---|---|
| **1a - DOM slots + portals** | Shipped as sidebar plugins host API | [editor-ui#1532](https://github.com/RaspberryPiFoundation/editor-ui/pull/1532), [editor-standalone#996](https://github.com/RaspberryPiFoundation/editor-standalone/pull/996) |
| **4 - React `<Editor />` import** | Explored only; not a current host contract | [editor-ui#1533](https://github.com/RaspberryPiFoundation/editor-ui/pull/1533), [editor-standalone#997](https://github.com/RaspberryPiFoundation/editor-standalone/pull/997) |

## React slots vs DOM slots

| Pattern | What crosses the boundary | Safe? |
|---|---|---|
| **React slots** | Components, element objects, functions that return JSX - editor-ui renders them in its React tree | No |
| **DOM slots** | Plain `HTMLElement` mount points; the host portals its own React content into them | Yes |

At the time of the investigation, feedback used a hybrid: editor-ui rendered
standalone **React-slot** JSX (`panel()` / `buttons()` / icon components) to
create mount points (unsafe), then standalone portaled the real UI into those
DOM nodes (safe). That mix was the source of confusion.

Portaling host React into a plain DOM mount point is safe as long as editor-ui
never reconciles that content. Details: [Sidebar plugins](../SidebarPlugins.md).

### What was unsafe (React slots)

```js
{
  name: "feedback",
  icon: FeedbackIcon,                // React component from standalone
  buttons: () => <div ref={...} />,  // JSX from standalone's React
  panel: () => <div ref={...} />,    // JSX from standalone's React
  // ...
}
```

Editor-ui called `plugin.panel()` / `plugin.buttons()` and rendered
`plugin.icon` inside its own React tree. Separate React instances do not share
the same internal contract (`$$typeof`, fibers, hooks dispatcher, context) -
that mismatch caused the React 18/19 crash. Aligning both apps on React 19
stopped the crash but did not fix the design: future version skew or hooks in
plugin components would still break.

```text
editor-standalone React
  |  passes React-slot functions/components
  v
editor-ui React  <-- crash risk: renders host React elements
  |  creates empty <div>s
  v
plain DOM <div>
  ^
  |  standalone createPortal(FeedbackPanel)  <-- this part is fine
editor-standalone React
```

## Alternatives considered

### 1a) DOM slots + portals (shipped)

Serialisable plugin config + empty DOM mount points + host portals. No
React-slot crossing. Live API: [Sidebar plugins](../SidebarPlugins.md).

| Before (React slots) | After (DOM slots) |
|---|---|
| `icon: FeedbackIcon`, `panel: () => <div ref=…>` | `icon: "rate_review"`, `slots: ["panel"]` |
| Editor-ui called `plugin.panel()` - host JSX in editor-ui's tree | Editor-ui renders its own empty `<div>`s |
| Ref callbacks on host JSX rendered inside editor-ui | Host queries shadow DOM and portals in |

```text
editor-standalone
  │  serialisable config  ──►  setSidebarPlugins()
  │  finds DOM slot <div>s  ◄──  PluginSlot in shadow DOM
  └── createPortal(FeedbackPanel) ──►  into those DOM slots
```

Classroom wiring: `feedbackPanelPlugin.js`, `pluginsHelper.js`,
`SchoolProject.jsx` in `editor-standalone`.

### 1b) Formal DOM-slot API (deferred)

Same DOM-slot model as 1a, but with explicit register / slot-ready /
unregister events instead of informal shadow-DOM observation. Consider if
discovery proves brittle or more host plugins appear.

### 2) Host UI outside `editor-wc` (not chosen)

Render feedback entirely in standalone around the editor. Safest boundary,
but weaker sidebar UX and less reusable as a platform pattern.

### 3) Shared React singleton / externals (avoid)

Make `editor-wc` use the host's React so React slots might work. Undermines
the self-contained script-tag embed (external consumers often have no React,
or a different version). Prefer DOM slots (1a) or a real React import (4).

### 4) React `<Editor />` import (explored)

Import `<Editor />` from `editor-ui` into `editor-standalone` for one React
tree and normal composition. External embeds would need a thin `editor-wc`
adapter or an explicit deprecation path.

The spike showed this is not “just swap the import”: React UI can share a
tree, but runtime assets (Pyodide, html-renderer, scratch-frame) still load
over HTTP separately. Production needs same-origin (or CDN) asset packaging,
and Redux does not merge automatically - start with props/callbacks.

Friction: transpile linked `editor-ui` source, shadow-DOM assumptions in
runners/modals, yarn-link / Docker packaging vs today's `editor-static` model.

## Recommended direction

| Timeframe | Direction |
|---|---|
| Immediate | **1a - DOM slots** (**shipped** - [Sidebar plugins](../SidebarPlugins.md)) |
| If staying on `editor-wc` | Evolve 1a → **1b** if DOM-slot discovery gets brittle |
| Strategic (first-party) | **4 - React `<Editor />`** for standalone; keep `editor-wc` adapter for external hosts if decided |
| Avoid | Investigation-time **React slots**; **3** (shared React singleton) |
