# Feedback Panel Investigation — Problem Outline

## Summary

The classroom feedback panel is injected from `editor-standalone` into `editor-ui` via the `editor-wc` web component (`setSidebarPlugins`). The plugin contract currently passes React components, functions, and JSX created by standalone's React bundle, which `editor-ui` then renders in its own React tree.

Because `editor-standalone` and `editor-ui` are separate bundles with separate React instances, this is fragile. It recently broke when standalone moved to React 19 while editor-ui was still on React 18. Aligning both on React 19 fixed the crash, but the pattern remains risky (hooks, context, portals, future version skew).

DOM slots plus portals are the safe pattern for the actual feedback content. The unsafe part is using React slots — passing and rendering React components, element objects, and JSX across the web component boundary.

Two code spikes were undertaken to explore fixes — see [Code spikes undertaken](#code-spikes-undertaken) below.

### Terminology

| Term | Meaning in this document |
|---|---|
| First party | The team working on `editor-standalone` — and `editor-standalone` itself |
| External consumers | Anyone else currently using and embedding `editor-ui` (e.g. Mission Zero, sites via `editor-static`) |

---

## Code spikes undertaken

Two code spikes were undertaken as part of this investigation:

1. **Quick fix (Alternative 1a)** — keep `<editor-wc>` and remove React-slot crossing. This is a candidate to ship now to prevent further breaks with the current web-component integration while React versions or plugin usage evolve.
2. **Strategic integration (Alternative 4)** — import `<Editor />` from `editor-ui` directly in `editor-standalone` instead of embedding via `<editor-wc>`. This spike explores how we might work more easily with standard React patterns across the two projects; its findings may inform broader frontend architecture choices, not only the feedback panel.

### Quick fix — Alternative 1a: don’t use React slots

- Outline: [spike-1-alternative-1a-DOM-slots+standalone-portals.md](spike-1-alternative-1a-DOM-slots+standalone-portals.md)
- **editor-ui**
  - Draft PR: https://github.com/RaspberryPiFoundation/editor-ui/pull/1532
  - Branch: https://github.com/RaspberryPiFoundation/editor-ui/tree/feedback-spike-branch-1
- **editor-standalone**
  - Draft PR: https://github.com/RaspberryPiFoundation/editor-standalone/pull/996
  - Branch: https://github.com/RaspberryPiFoundation/editor-standalone/tree/feedback-spike-branch-1

### Enable easy use of React methods — Alternative 4: if the editor was a React component rather than a web component

- Outline: [spike-2-using-react-rather-than-web-component.md](spike-2-using-react-rather-than-web-component.md)
- **editor-ui**
  - Draft PR: https://github.com/RaspberryPiFoundation/editor-ui/pull/1533
  - Branch: https://github.com/RaspberryPiFoundation/editor-ui/tree/feedback-spike-branch-2
- **editor-standalone**
  - Draft PR: https://github.com/RaspberryPiFoundation/editor-standalone/pull/997
  - Branch: https://github.com/RaspberryPiFoundation/editor-standalone/tree/feedback-spike-branch-2

---

## Current Flow

1. `SchoolProject` (standalone) decides when to show feedback (student with feedback, or teacher viewing student work).
2. It calls `createFeedbackPanelPlugin(...)` to build a plugin object and registers it via `renderSidebarPlugin(...)`.
3. `renderSidebarPlugin` finds `<editor-wc>`, waits for the custom element, and calls `setSidebarPlugins([...existing, plugin])`.
4. `editor-wc` (editor-ui) stores `sidebarPlugins` and re-renders its React app with that array.
5. `Sidebar` (editor-ui) maps plugins into sidebar menu options and renders `plugin.icon`, `plugin.buttons()`, and `plugin.panel()` inside its own React tree.
6. The plugin's `panel` and `buttons` return empty `<div>` elements with ref callbacks that capture DOM nodes back into standalone state.
7. `SchoolProject` uses `createPortal` to render `FeedbackPanel` and action buttons from standalone's React into those captured DOM nodes.

### Key files

| Area | File |
|---|---|
| Plugin creation | `editor-standalone/src/plugins/feedbackPanelPlugin.js` |
| Plugin registration | `editor-standalone/src/utils/pluginsHelper.js` |
| Host orchestration | `editor-standalone/src/components/Editor/SchoolProject/SchoolProject.jsx` |
| Portal helper | `editor-standalone/src/plugins/FeedbackPortal.jsx` |
| Feedback UI | `editor-standalone/src/plugins/FeedbackPanel.jsx` |
| Web component API | `editor-ui/src/web-component.js` |
| Sidebar rendering | `editor-ui/src/components/Menus/Sidebar/Sidebar.jsx` |

---

## Two Boundaries — React Slots vs DOM Slots + Portals

| Pattern | What crosses the boundary | Safe? |
|---|---|---|
| React slots | Components, element objects, functions that return JSX — editor-ui renders them in its React tree | No |
| DOM slots + portals | Plain `HTMLElement` mount points; standalone portals its own React content into them | Yes |

The feedback panel uses both patterns today: editor-ui renders standalone's React slot JSX to create the mount points (unsafe), then standalone portals the real UI into those DOM nodes (safe). That mix is the source of confusion.

---

## What Is Safe

Portaling standalone React into a DOM node inside editor-ui is safe, as long as editor-ui never tries to render or reconcile that React content itself.

```jsx
// standalone owns this entirely
createPortal(<FeedbackPanel />, feedbackContainer)
```

- `feedbackContainer` is a plain DOM `<div>`
- `FeedbackPanel` is created and reconciled by standalone's React
- The portal only changes where in the DOM standalone paints — it does not hand off React ownership to editor-ui

This is why the real feedback UI (`FeedbackPanel`, complete/return buttons, modals) works once the mount node exists.

### Hooks, context, and state still work

A portal changes where the DOM goes, not which React app owns the component. The portaled component remains a child in standalone's React tree, even though its HTML is rendered inside editor-ui's sidebar.

Because ownership stays in the original React tree:

- **Hooks** (`useState`, `useEffect`, `useSelector`, etc.) run under the same component instance and fiber tree as if `FeedbackPanel` were rendered inline in `SchoolProject`.
- **Context** (`Provider`/`Consumer`) resolves by React ancestry, not DOM ancestry — so standalone providers still apply.
- **Redux / app state** works as long as the portaled component is still under the same `<Provider>` in standalone's React tree (e.g. standalone auth, classroom Redux, i18n).

`FeedbackPanel` can therefore use `useSelector`, `useAuth`, and `useTranslation` from standalone, even though its DOM node lives inside `<editor-wc>`. It does not get access to editor-ui's Redux or context — which is what we want for classroom-specific UI.

### Why portals + DOM slots are a better fit than React slots

| Approach | What crosses the boundary | Hooks / context / state |
|---|---|---|
| React slots (pass JSX/components into editor-ui to render) | React elements, components, functions | Broken — editor-ui's React tries to own standalone's components |
| DOM slots + portals (editor-ui exposes empty `<div>`s; standalone portals into them) | Plain DOM nodes only | Works — standalone keeps full React ownership |

React composition slots (`children`, render props, `panel: () => <MyPanel />`) are a good pattern within a single React app. They are a poor fit across the `editor-wc` boundary because the host and editor are separate React instances.

DOM mount slots combined with portals give the same visual result — feedback UI appears inside the editor sidebar — without crossing React ownership. Editor-ui owns the shell; standalone owns the content and all of its application state.

---

## What Is Unsafe

The plugin object passed to `setSidebarPlugins` includes React-owned values from standalone:

```js
{
  name: "feedback",
  title: "...",
  heading: "...",
  icon: FeedbackIcon,           // React component from standalone
  buttons: () => <div ref={...} />,  // JSX from standalone's React
  panel: () => <div ref={...} />,    // JSX from standalone's React
  position: "top",
  autoOpen: true,
}
```

Editor-ui then renders these inside its React tree:

- `Sidebar` calls `plugin.panel()` and `plugin.buttons()` as children of `SidebarPanel`
- `SidebarBar` renders `plugin.icon` as `<ButtonIcon />`

When editor-ui's reconciler processes element objects created by standalone's `React.createElement`, the two React instances do not share the same internal contract (`$$typeof`, fiber expectations, hooks dispatcher, context). This caused the React 18/19 crash.

### Three concrete failure points

1. **Sidebar icon** — `FeedbackIcon` is a standalone component rendered by editor-ui as `<ButtonIcon />`
2. **Panel/button mount-slot JSX** — `plugin.panel()` and `plugin.buttons()` return JSX from standalone, rendered by editor-ui (even though the divs are empty)
3. **Real feedback UI** — intentionally avoided; standalone portals `FeedbackPanel` instead of editor-ui rendering it

---

## Architecture Diagram

```text
editor-standalone React
  |
  | passes plugin object with React functions/components
  v
editor-ui React
  |
  | renders sidebar chrome + empty slot divs   <-- crash risk lives here
  v
plain DOM <div>
  ^
  |
  | standalone createPortal(FeedbackPanel)
  |
editor-standalone React again                <-- this part is fine
```

The current pattern is a hybrid mount-slot approach: the intent is correct (editor-ui owns sidebar layout; standalone owns classroom content), but the contract still includes React-renderable things instead of serializable config plus DOM slots.

---

## Why React 19 Alignment Fixed the Crash But Not the Design

Aligning both bundles on React 19 made the element objects temporarily compatible again, so editor-ui could render standalone's plugin JSX without immediately crashing.

The underlying risk remains:

- Future React version skew between bundles
- Hooks/context in plugin components would break (silently or loudly)
- Any new plugin following this pattern inherits the same fragility

---

## Current usage scope

| Consumer | In this repo? | Integration |
|---|---|---|
| editor-standalone | Yes | `<editor-wc>` via `web-component.js` from `editor-static` |
| setSidebarPlugins / feedback panel | Yes — only `SchoolProject` | Classroom-only; no other plugin callers in codebase |
| experience-cs, profile, editor-api | No | No `editor-wc` usage found |
| External consumers | Not in this workspace | `editor-ui` is published to `editor-static` for script-tag embed (README cites Mission Zero, embedded mode, “other sites”) |

The sidebar plugin API is generic in `editor-ui`, but feedback is the only production consumer today. Any fix to the plugin contract should still be designed as a platform capability, not feedback-only — but scope for the immediate ticket can remain classroom feedback.

Follow-up: audit which external consumers load `editor-static` / `<editor-wc>` in production before wider API changes (especially Alternative 4).

---

## Related cross-boundary patterns checked

| Pattern | Location | Verdict |
|---|---|---|
| Feedback portal | `editor-standalone` → DOM slot in `editor-wc` | Safe (standalone owns React); plugin JSX crossing is the problem |
| ExternalFiles portal | `editor-ui` → `document.body` | Safe — internal to editor-ui only |
| react-modal in GeneralModal | Both apps | Safe — DOM placement for modals, not React handoff across bundles |
| setSidebarPlugins | Only feedback panel | Only unsafe cross-React integration in production use |

---

## Alternative apporaches

### Current risky pattern - React slots/components across boundary (current risky pattern — approach to move away from)

Pass `icon`, `panel()`, `buttons()` as React components/functions/JSX from standalone and let editor-ui render them.

- **Pros:** Convenient developer ergonomics in a single React app.
- **Trade-off:** Unsafe across separate bundles/React instances; version skew can break at runtime.
- **Trade-off:** Hooks/context assumptions become fragile because ownership is ambiguous.

### Alternative 1) DOM slots + standalone portals (keep `editor-wc` — recommended baseline)

Both sub-options use the same core model: `editor-ui` exposes empty mount points in the sidebar; `editor-standalone` portals its own React UI into those nodes. Serialisable config crosses the boundary; React does not. Start with 1a for the feedback panel quick fix; move to 1b only if a more formal, evolvable contract is needed.

#### Alternative 1a) Minimal contract (quick fix)

Spike branch, draft PRs, and outline: see [Quick fix — Alternative 1a](#quick-fix--alternative-1a-dont-use-react-slots) above.

`editor-ui` renders slot `<div>` elements from serialisable plugin config (not standalone JSX). Standalone discovers those nodes and portals content in — similar to today, but without React-slot crossing for icon, panel, or buttons.

Pros

- Preserves standalone app state correctly — hooks, context, Redux, auth, and i18n all stay in standalone.
- Keeps visual integration — feedback appears inside the editor sidebar where users expect it.
- Low conceptual change from today — content is already portaled; this mainly removes React-slot crossing for shell bits (icon, slot divs).
- React-version isolation — bundles can upgrade independently without cross-render crashes.
- Scoped implementation — can migrate feedback first without rewriting all `editor-wc` integration.

Cons

- Lifecycle complexity — host must wait for slot nodes to exist, handle remounts, and clean up on unmount.
- DOM lookup fragility — `document.querySelector("editor-wc")` and shadow DOM traversal can be brittle if multiple editors exist on a page.
- Styling boundaries — portaled content may need careful CSS/`part` styling across shadow DOM and the host app.
- Testing overhead — integration tests need both apps and slot timing behaviour.
- Not fully formalised — slot discovery can remain ad hoc unless evolved to 1b.

#### Alternative 1b) Formal host mount API/events (if needed beyond the 1a quick fix)

An extension of 1a, not a separate approach: same DOM slots and portals, but with an explicit `editor-wc` API (register plugin metadata, slot-ready notifications, unregister) and versioning — instead of informal DOM lookup and timing assumptions.

Pros

- Everything in 1a, plus a clear boundary contract — serialisable config only; no accidental React passing.
- Better lifecycle semantics — explicit register/update/unregister and slot-ready events reduce race conditions.
- Versionable and capability-based — can add `supportsSidebarSlotsV2` and evolve safely.
- Easier to enforce — runtime validation can reject non-serialisable plugin payloads.
- Better for future plugins — not just feedback; becomes a platform feature.

Cons

- More upfront design work than 1a — event names, payload schema, teardown rules, error handling.
- API maintenance burden — docs, tests, and backward-compatibility policy needed.
- Slightly more boilerplate in the host — standalone code becomes more explicit than “pass a plugin object”.
- Potential over-engineering risk — if feedback remains the only consumer for a long time.
- Still portal-based complexity — does not remove DOM/shadow concerns, only structures them better.

### Alternative 2) Host UI outside `editor-wc`

Render classroom UI entirely in standalone around the editor instead of inside editor-ui sidebar.

Pros

- Simplest and safest boundary — almost no cross-app UI contract required.
- Fastest to stabilise — removes the fragile plugin path entirely for feedback.
- Easier debugging and ownership — all classroom UI lives in one React app.
- Fewer integration edge cases — no slot timing, no plugin auto-open competition with built-in panels.
- Good fallback if sidebar embedding proves too costly.

Cons

- UX mismatch — feedback may feel detached from the editor sidebar workflow.
- Layout and responsive work — standalone must manage placement across desktop/mobile while the editor has its own responsive behaviour.
- Duplicated navigation patterns — users may need to discover feedback outside standard sidebar affordances.
- Less reusable platform pattern — harder to add future host-specific sidebar features consistently.
- Potential product pushback — if design intent is “feedback is a sidebar panel”, this is a compromise.

### Alternative 3) Host-provided React singleton across bundles (externals / module federation — likely avoid)

Configure the build so `editor-ui` does not bundle its own React, and instead expects the host page to already provide React (via webpack `externals`, module federation, or similar). Both `editor-standalone` and `editor-ui` would then use that one copy of React — which might make the current React-slot pattern work without crashing.

Unlike the following Alt 4, Alt 3 is keeps the web component as a separate bundle, but makes bundle depend on React already being on `window` (or federated from the host).”

#### Why this is a strange match for `web-component.js`

Web components are usually built to be self-contained: one script tag, no assumptions about what else is on the page. That is the normal pattern for embeddable UI — the bundle brings everything it needs to run.

`editor-wc` follows that model today: add `web-component.js` to the page, set attributes, call methods — done. The host site does not need React. It does not need to install or match our React version. It does not need any special bundler setup on its side.

Alt 3 goes against that norm. The script would stop shipping React inside the bundle and instead assume React is already on the page — loaded separately, at a compatible version. That is workable for `editor-standalone`, where the first-party team controls both apps. It is a poor fit for external consumers (Mission Zero, other sites via `editor-static`). Those sites often have no React at all, or run a different version we cannot rely on.

In short: Alt 3 trades the usual self-contained web component benefit — “drop in one script and it works” — for a chance to keep passing React components across bundle boundaries.

Pros

- Might unblock the existing React-slot plugin API without redesigning to DOM slots — `panel()`, `icon`, etc. could render as if they lived in one app.
- Keeps the current “load `editor-wc` + `setSidebarPlugins`” integration shape for standalone.
- Familiar React mental model if teams already think in terms of shared `react` on the page.

Cons

- **Breaks or complicates the script-tag embed story** — external consumers must supply compatible React/ReactDOM (or you ship two build variants: “bundled React” vs “host React”).
- **High operational coupling** — React (and often react-redux, etc.) versions must match across repos, releases, and host apps; the failure mode is subtle runtime errors, not clean compile failures.
- **Build/deploy complexity** — you need build rules to share React, enforce a single copy at runtime, and test both “React bundled in” and “React supplied by host” variants.
- **Poor architectural clarity** — solves render compatibility while keeping an unsafe cross-bundle component-passing contract.
- **Harder onboarding** — contributors must understand “which React is this bundle using?” and embed documentation becomes longer and more error-prone.

### Alternative 4) React component import (hybrid — recommended strategic direction)

Spike branch, draft PRs, and outline: see [Enable easy use of React methods — Alternative 4](#enable-easy-use-of-react-methods--alternative-4-if-the-editor-was-a-react-component-rather-than-a-web-component) above.

Export a shared `<Editor />` React API from `editor-ui` and import it directly in `editor-standalone`, replacing `<editor-wc>` for first-party integration. External consumers who embed `editor-ui` via `<editor-wc>` (script tag, attributes, imperative APIs) would need continued support — ideally via a thin web component adapter over the same React core, but any refactor of editor-ui's public surface could affect them and must be assessed.

Implementation reality: This is likely to be difficult to implement cleanly and may involve a fair amount of hacking to get working, even for first-party use. Early spike work on `feedback-spike-branch-2` surfaced issues that are architectural, not just “swap the import”:

- **Build tooling** — standalone must transpile linked `editor-ui` source (babel, SCSS, webpack `include` paths, `ModuleScopePlugin`, ESM resolution). Misconfiguration can silently break *all* standalone styles, not only the editor.
- **Runtime assets** — translations, `PyodideWorker.js`, pyodide wheels, shims, and copydecks still load over HTTP separately from the React bundle; a dev-time shortcut (e.g. running `editor-ui` on port 3011) is not a production model.
- **Shadow DOM assumptions** — much of `editor-ui` was written for `<editor-wc>` (portals, style injection via `style-it`, `ASSETS_URL` baked into workers). React embed mode needs targeted changes across runners, modals, and i18n paths.
- **Packaging and local dev** — yarn link, Docker volume mounts, and env vars (`EDITOR_UI_ROOT`, `REACT_APP_EDITOR_UI_ASSETS_URL`) add friction compared with today’s script-tag + `editor-static` model.

The strategic direction may still be right, but budget for integration engineering and spike time — not a straightforward refactor. See [spike-2-using-react-rather-than-web-component.md](spike-2-using-react-rather-than-web-component.md) for spike setup and known gaps.

Pros

- Removes the root cause of the feedback panel bug — one React runtime, no cross-boundary element passing.
- Host UI (feedback, classroom features) integrates naturally — composition, hooks, context, and Redux all work as in a single app.
- Strongest fit for `editor-standalone` as the first-party integration path — simpler mental model than attributes, events, and imperative APIs.
- Reduces ongoing integration tax — fewer workarounds (portals, plugin hacks, dep version alignment). Using standard approaches like slots across editor-standalone and editor-ui becomes less problematic.

Cons

- Larger architectural shift than fixing the plugin contract alone — not a quick patch.
- Tighter coupling between `editor-standalone` and `editor-ui` — releases and upgrades become more coordinated.
- Potentially two integration surfaces to maintain during transition (React import + web component adapter).
- **External consumers may be affected** — changes to `editor-wc` API, attribute contract, events, or packaging could break existing embeds; requires compatibility policy, versioning, and communication.
- Does not automatically simplify state — standalone and editor-ui still have separate concerns unless Redux is deliberately unified.
- Higher upfront cost before benefits are realised — spike and packaging work needed before feedback panel gets simpler.
- **Implementation may require hacks** — webpack/craco workarounds, separate asset servers in dev, and refactors of editor-ui code that assumed shadow DOM or web-component attributes; not all of this is reusable as a clean public npm API without further investment.

### Recommendation framing

- **Need integrated sidebar UX + standalone state ownership (keep `editor-wc`)?** → Alternative 1a now, evolve to 1b as the formal contract.
- **Need fastest stabilisation with minimal boundary work?** → Alternative 2.
- **Tempted to share React across bundles while keeping `editor-wc`?** → Alternative 3 (not recommended — undermines self-contained embed; prefer 1a or 4).
- **Need best long-term integration for `editor-standalone`?** → Alternative 4 (spike first on `SchoolProject`; assess impact on external consumers before wider rollout).

### Recommended direction

| Timeframe | Direction |
|---|---|
| Immediate (feedback panel fix) | Alternative 1a — serialisable plugin config + DOM slots + portals; remove React-slot crossing |
| If staying on `editor-wc` longer term | Evolve 1a → 1b when informal slot discovery proves brittle or more host plugins are added |
| Strategic (first-party integration) | Alternative 4 — shared React `<Editor />` for `editor-standalone`; retain `editor-wc` as thin adapter for external consumers (if decided) |
| Avoid | Current risky pattern; Alternative 3 (host-provided React singleton / externals) |

Alternative 1a and 4 are not mutually exclusive in sequence: 1a fixes the immediate bug on the current architecture; 4 is the larger payoff for standalone integration and eliminates the need for portal/plugin workarounds entirely.

---

## Initial Safer Direction (for follow-up)

Pass only serializable metadata across the boundary; use DOM mount slots for host UI.

### Proposed safe plugin contract

```js
{
  name: "feedback",
  title: "Teacher feedback",
  heading: "Feedback",
  icon: "rate_review",      // icon key, not a React component
  position: "top",
  autoOpen: true,
  slots: ["panel", "buttons"]
}
```

### Responsibilities

| Layer | Owns |
|---|---|
| editor-ui | Sidebar chrome, icon rendering from its own component library, empty slot `<div>` elements (e.g. via `data-slot` or `part` attributes) |
| editor-standalone | Finds slot DOM nodes, portals `FeedbackPanel` and action buttons into them with its own React root |

At that point, the only thing crossing the web component boundary is DOM, not React.

