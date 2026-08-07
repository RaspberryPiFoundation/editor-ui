# Sidebar plugins

The editor features an API that allows you to add a custom panel to the editor sidebar from the host page - without forking
`editor-ui`. The web component draws the sidebar chrome (icon, heading, empty
mount points). Your host fills those mount points with its own UI.

A concrete example is teacher feedback in Code Classroom
(`editor-standalone`): that app registers a "feedback" plugin, then portals
its React panel into the slots the editor exposes.

## When to use this

Use it when the host needs product-specific sidebar UI that does not belong
in `editor-ui` itself (feedback, classroom tools, and similar).

Do not use it for panels the editor already ships. Turn those on with the
`sidebar_options` attribute (`"file"`, `"settings"`, `"instructions"`, and so
on) and `with_sidebar="true"`.

## How it works

1. The host calls `setSidebarPlugins([...])` on `<editor-wc>` with a plain JS object.
2. The editor re-renders and adds a sidebar icon for each plugin.
3. When a plugin panel is open, the editor creates empty `<div>` slots inside
   its shadow DOM.
4. The host finds those slots and attaches its own content (portals in React,
   or plain DOM in vanilla JS).

When the host app is a React app, only serialisable config should cross the
web component boundary. Do not pass React components, JSX, or functions for
the editor to render - the host and the editor should be considered separate
React trees (when both use React), and sharing them that way breaks.

```text
Host page                          <editor-wc> (shadow DOM)
─────────                          ─────────────────────────
setSidebarPlugins({ name, … })  →  sidebar icon + empty slot <div>s
find slot in shadowRoot         ←  data-sidebar-plugin / …-slot
attach host UI into the <div>   →  your panel / buttons appear
```

## API

### `setSidebarPlugins(plugins)`

Replaces the full list of host sidebar plugins and remounts the React app
inside the web component.

```js
editor.setSidebarPlugins([
  {
    name: "feedback",
    title: "Teacher feedback",
    heading: "Feedback",
    icon: "rate_review",
    position: "top",
    autoOpen: true,
    slots: ["panel", "buttons"],
  },
]);
```

Passing `[]` clears all host plugins.

### `sidebarPlugins`

The current plugin list on the element. Host helpers often read this so they
can add a plugin without wiping ones already registered:

```js
const existing = editor.sidebarPlugins || [];
```

### Plugin shape

| Field | Type | Meaning |
| --- | --- | --- |
| `name` | string | Stable id. Used as the sidebar option key and in slot selectors. Treat as unique. |
| `title` | string | Tooltip / accessible label on the sidebar icon |
| `heading` | string | Heading shown at the top of the open panel |
| `icon` | string | [Material Symbols](https://fonts.google.com/icons) name (e.g. `"rate_review"`). The editor renders the icon. |
| `position` | `"top"` \| `"bottom"` | Where the icon sits in the sidebar bar. Defaults to `"top"`. |
| `autoOpen` | boolean | If `true`, this panel opens when the editor first shows it. Only the first matching plugin wins. |
| `slots` | `("panel" \| "buttons")[]` | Which empty mount points to create. `"panel"` is the main body; `"buttons"` is the panel header action area. |

### Slot markup

For a plugin with `name: "feedback"` and `slots: ["panel", "buttons"]`, the
editor creates empty elements like:

```html
<div
  part="sidebar-plugin-panel-container"
  data-sidebar-plugin="feedback"
  data-sidebar-plugin-slot="panel"
></div>

<div
  part="sidebar-plugin-button-container"
  data-sidebar-plugin="feedback"
  data-sidebar-plugin-slot="buttons"
></div>
```

These live in the **shadow DOM**, so `document.querySelector(...)` from the
light DOM will not find them. Query `editor.shadowRoot` instead. The `part`
attributes are there so hosts can style the containers with `::part(...)` if
needed.

Slots appear when the plugin panel is mounted (including when `autoOpen` opens
it). They can appear and disappear as the user opens and closes panels, so do
not query for them only once at startup - watch for changes and re-attach when
a slot node is created or replaced.

## Vanilla JS / HTML example

```html
<script src="https://editor-static.raspberrypi.org/releases/<version>/web-component.js"></script>

<editor-wc with_sidebar="true" sidebar_options='["file","settings"]'></editor-wc>

<script type="module">
  await customElements.whenDefined("editor-wc");

  const editor = document.querySelector("editor-wc");

  editor.setSidebarPlugins([
    {
      name: "notes",
      title: "Notes",
      heading: "Notes",
      icon: "sticky_note_2",
      position: "top",
      autoOpen: false,
      slots: ["panel"],
    },
  ]);

  // Shadow root is created when the element connects - wait if needed.
  const waitForShadowRoot = () =>
    new Promise((resolve) => {
      if (editor.shadowRoot) {
        resolve(editor.shadowRoot);
        return;
      }
      const id = setInterval(() => {
        if (editor.shadowRoot) {
          clearInterval(id);
          resolve(editor.shadowRoot);
        }
      }, 50);
    });

  const root = await waitForShadowRoot();

  const attachPanel = () => {
    const slot = root.querySelector(
      '[data-sidebar-plugin="notes"][data-sidebar-plugin-slot="panel"]',
    );
    if (!slot || slot.dataset.hostAttached) return;

    slot.dataset.hostAttached = "true";
    const content = document.createElement("div");
    content.textContent = "Host-owned notes go here.";
    slot.appendChild(content);
  };

  // Open the panel (or set autoOpen: true) before the slot exists.
  // Then watch - slots are created/destroyed as panels open and close.
  new MutationObserver(attachPanel).observe(root, {
    childList: true,
    subtree: true,
  });
  attachPanel();
</script>
```

## React example

You do not need React to use this API. A React host typically:

1. Builds a plain plugin object.
2. Calls `setSidebarPlugins` once the custom element is defined.
3. Observes the shadow root for slot nodes.
4. Uses `createPortal` to render host components into those nodes.

In `editor-standalone` that looks like:

| Step | Where |
| --- | --- |
| Plugin config | `src/plugins/feedbackPanelPlugin.js` (`createFeedbackPanelPlugin`) |
| Register + observe slots | `src/utils/pluginsHelper.js` (`renderSidebarPlugin`, `observeSidebarPluginSlots`) |
| Wire-up + portals | `src/components/Editor/SchoolProject/SchoolProject.jsx` |

A simplified version of that pattern:

```js
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const plugin = {
  name: "feedback",
  title: "Teacher feedback",
  heading: "Feedback",
  icon: "rate_review",
  position: "top",
  autoOpen: true,
  slots: ["panel", "buttons"],
};

function FeedbackSidebar({ children }) {
  const [panelEl, setPanelEl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let observer;

    customElements.whenDefined("editor-wc").then(() => {
      const editor = document.querySelector("editor-wc");
      if (!editor) return;

      const existing = editor.sidebarPlugins || [];
      if (!existing.some((p) => p.name === plugin.name)) {
        editor.setSidebarPlugins([...existing, plugin]);
      }

      const tryAttach = () => {
        const root = editor.shadowRoot;
        if (!root || cancelled) return;
        const slot = root.querySelector(
          '[data-sidebar-plugin="feedback"][data-sidebar-plugin-slot="panel"]',
        );
        setPanelEl(slot || null);
      };

      const start = () => {
        if (!editor.shadowRoot || cancelled) return;
        tryAttach();
        observer = new MutationObserver(tryAttach);
        observer.observe(editor.shadowRoot, { childList: true, subtree: true });
      };

      // shadowRoot may not exist until connectedCallback runs
      if (editor.shadowRoot) start();
      else {
        const id = setInterval(() => {
          if (editor.shadowRoot) {
            clearInterval(id);
            start();
          }
        }, 50);
      }
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return panelEl ? createPortal(children, panelEl) : null;
}
```

`editor-standalone`'s `observeSidebarPluginSlots` also polls briefly until the
shadow root appears (`attachShadow` does not fire light-DOM mutation observers)
and cleans up cleanly on unmount - prefer that helper if you are in that app.

## Pitfalls

**Shadow DOM** - Slot nodes are not in the light DOM. Always search
`editor.shadowRoot`.

**Register by name** - `setSidebarPlugins` replaces the whole list. If you add
plugins one at a time, merge with `sidebarPlugins` first and skip when `name`
is already present. Re-registering the same name with a different `autoOpen`
will not re-apply auto-open once the panel has already been shown.

**Remounts** - Calling `setSidebarPlugins` remounts the React tree inside the
web component. Prefer registering once when you know you need the plugin, not
on every render.

**Do not pass React across the boundary** - Prefer non-React slots with
host-owned content. An older code path (`panel()` / `buttons()` functions that
return JSX for the editor to render) still exists for transitional hosts; but this should be considered deprecated as it
is unsafe across separate React bundles and should not be used for new work.

**Built-in panels** - Plugins sit alongside `sidebar_options`. You still need
the `with_sidebar="true"` attribute on `<editor-wc>` for the sidebar to show at all.

## Further reading

- Why this shape: [Feedback panel investigation](design-notes/feedback-panel-investigation.md)
