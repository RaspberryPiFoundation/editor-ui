# Alternative 1a — DOM slots + standalone portals

**Related issue:** [digital-editor-issues #1501](https://github.com/RaspberryPiFoundation/digital-editor-issues/issues/1501) — feedback panel / cross-boundary React integration; this spike explores replacing `<editor-wc>` with a direct `<Editor />` import as a longer-term fix.

**Branches required:** this spike must be checked out in **both** repos:

| Repo | Branch |
|---|---|
| `editor-standalone` | `feedback-spike-branch-1` |
| `editor-ui` | `feedback-spike-branch-1` |

This document describes how the feedback panel spike works on those branches. It implements **Alternative 1a** from the feedback panel investigation: serialisable plugin config crosses the `editor-wc` boundary; React does not.

## The idea

Two separate React apps share the page:

- **editor-standalone** — owns classroom UI (feedback panel, buttons, Redux, auth)
- **editor-ui** (inside `<editor-wc>`) — owns the editor sidebar chrome

The old approach passed **React things** (components, JSX, functions) from standalone into editor-ui. That broke across bundle boundaries (e.g. React 18/19 skew).

The new approach passes only **plain data** (strings, booleans, arrays). Editor-ui renders empty DOM mount points; standalone **portals** its React UI into those nodes.

```text
editor-standalone (React app A)
  │
  │  1. serialisable plugin config  ──────────►  editor-wc.setSidebarPlugins()
  │     { name, title, icon: "rate_review", slots: [...] }
  │
  │  2. finds empty <div> slots in shadow DOM  ◄──  editor-ui renders PluginSlot divs
  │
  └── 3. createPortal(FeedbackPanel) ──────────►  into those divs
```

---

## Step 1 — Standalone decides when to show feedback

In `SchoolProject.jsx`, a `useEffect` runs when:

- a **student** has feedback on their project, or
- a **teacher** is viewing student work

It builds a plugin config via `createFeedbackPanelPlugin()`:

```js
{
  name: "feedback",
  title: "…",
  heading: "…",
  icon: "rate_review",        // string, not a React component
  position: "top",
  autoOpen: true,
  slots: ["panel", "buttons"] // or just ["panel"] for students
}
```

No functions. No JSX. Safe to pass across the web component boundary.

**File:** `editor-standalone/src/plugins/feedbackPanelPlugin.js`

---

## Step 2 — Registering the plugin with editor-ui

`renderSidebarPlugin()` in `pluginsHelper.js`:

1. Finds `<editor-wc>` on the page
2. Waits for the custom element to be defined
3. Calls `webComponent.setSidebarPlugins([...existing, plugin])`

That triggers editor-ui to re-render with the new plugin in its sidebar config.

**File:** `editor-standalone/src/utils/pluginsHelper.js`

---

## Step 3 — Editor-ui renders the sidebar shell

In `Sidebar.jsx`, when a plugin has a `slots` array:

- **Icon:** `"rate_review"` → editor-ui's own `MaterialSymbol` component (rendered inside editor-ui's React tree)
- **Panel chrome:** heading, layout via `SidebarPanel`
- **Mount points:** empty `<div>` elements from `PluginSlot`:

```html
<div data-sidebar-plugin="feedback" data-sidebar-plugin-slot="panel"></div>
<div data-sidebar-plugin="feedback" data-sidebar-plugin-slot="buttons"></div>
```

Editor-ui owns the sidebar structure. It does **not** know what goes inside those divs.

**Files:**

- `editor-ui/src/components/Menus/Sidebar/Sidebar.jsx`
- `editor-ui/src/components/Menus/Sidebar/PluginSlot.jsx`
- `editor-ui/src/components/Menus/Sidebar/MaterialSymbol.jsx`

---

## Step 4 — Standalone finds the slot DOM nodes

`observeSidebarPluginSlots("feedback", { panel: setFeedbackContainer, buttons: setButtonContainer })`:

1. Gets `editor-wc.shadowRoot` (editor-ui lives in shadow DOM)
2. Queries for `[data-sidebar-plugin="feedback"][data-sidebar-plugin-slot="panel"]` (and `buttons`)
3. When found, calls `setFeedbackContainer(domNode)` / `setButtonContainer(domNode)`
4. Uses a `MutationObserver` to retry when the sidebar re-renders (e.g. after `setSidebarPlugins`, panel open/close, remounts)

Slots do not exist until editor-ui has rendered the feedback sidebar entry, so observation handles timing rather than a one-shot query.

**File:** `editor-standalone/src/utils/pluginsHelper.js`

---

## Step 5 — Portals render the real UI

Once `feedbackContainer` / `buttonContainer` are set, `SchoolProject` renders:

```jsx
<FeedbackPortal container={feedbackContainer}>
  <FeedbackPanel ... />
</FeedbackPortal>
```

`FeedbackPortal` is `createPortal(children, container)`.

Although the DOM nodes live **inside** editor-ui's shadow tree, the React components are rendered by **standalone's** React reconciler. So:

- standalone Redux works
- standalone hooks and context work
- standalone i18n works

Portals keep React ancestry in standalone; only the DOM placement is in editor-ui.

**Files:**

- `editor-standalone/src/components/Editor/SchoolProject/SchoolProject.jsx`
- `editor-standalone/src/plugins/FeedbackPortal.jsx`

---

## What crosses the boundary vs what doesn't

| Crosses boundary | Stays on its own side |
|---|---|
| `{ name, title, heading, icon, slots, autoOpen }` | `FeedbackPanel`, buttons, modals |
| Empty `<div>` DOM nodes (found via `querySelector`) | Icon rendering (`MaterialSymbol`) |
| | Sidebar layout, panel heading, menu bar |

---

## Student vs teacher

| Role | `slots` | Portaled content |
|---|---|---|
| **Student** | `["panel"]` | Feedback content only |
| **Teacher viewing work** | `["panel", "buttons"]` | Feedback panel + Complete/Return buttons |

---

## Before vs after

| Before | After |
|---|---|
| Standalone passed `icon: FeedbackIcon`, `panel: () => <div ref=…>` | Standalone passes `icon: "rate_review"`, `slots: ["panel"]` |
| Editor-ui called `plugin.panel()` — standalone JSX in editor-ui's React tree | Editor-ui renders its own empty divs |
| Ref callbacks captured DOM from standalone JSX rendered inside editor-ui | Standalone queries shadow DOM and portals in |

Same visual result (feedback in the sidebar), safer contract (data + DOM only, no cross-bundle React).

---

## Sequence

```text
SchoolProject mount
    │
    ├─► createFeedbackPanelPlugin()     (plain object)
    ├─► renderSidebarPlugin(plugin)      → setSidebarPlugins on editor-wc
    └─► observeSidebarPluginSlots(...)   → watch shadow DOM
              │
editor-ui re-renders Sidebar
    │
    ├─► shows feedback icon (MaterialSymbol)
    ├─► opens panel if autoOpen
    └─► renders PluginSlot divs
              │
observer finds divs
    │
    ├─► setFeedbackContainer(panelDiv)
    └─► setButtonContainer(buttonsDiv)
              │
SchoolProject re-renders
    │
    ├─► createPortal(FeedbackPanel → panelDiv)
    └─► createPortal(buttons → buttonsDiv)
```

---

## Possible follow-up (Alternative 1b)

If informal slot discovery via `MutationObserver` proves brittle, evolve to a formal contract: explicit `register` / `slot-ready` / `unregister` events from editor-ui when mount points are available.

---

## Browser check

### Before you open the browser

1. `editor-ui` running — `http://localhost:3011/web-component.js` loads
2. `editor-standalone` classroom running — `http://classroom.localhost:3013`
3. Logged in with API/auth working

### Scenario A — Teacher viewing student work

1. Open a **student’s project** (not the lesson template).
2. Confirm a **feedback icon** appears in the sidebar.
3. Confirm the **feedback panel opens** automatically.
4. Confirm **feedback form/content** shows inside the panel.
5. Confirm **Complete** and **Return** buttons appear in the panel header.

### Scenario B — Student with feedback

1. Log in as a **student** whose project has teacher feedback.
2. Open that project.
3. Confirm the **feedback icon** and **panel** appear.
4. If feedback is unread, the panel should **open automatically**.
5. Confirm feedback content shows; **no** Complete/Return buttons.

### DevTools checks

1. Inspect `<editor-wc>` and open its **shadow root**.
2. Find slot divs:
   - `data-sidebar-plugin="feedback"` + `data-sidebar-plugin-slot="panel"`
   - teacher only: `data-sidebar-plugin-slot="buttons"`
3. Confirm the portaled UI is rendered **inside** those divs.
4. Confirm there are **no React errors** in the console.
5. In the Network tab, confirm `web-component.js` is loaded from **`localhost:3011`**, not staging.
